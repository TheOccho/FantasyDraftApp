define("bot/FantasyDraftBot", function( require, exports, module ) {
	var instance = null,
		_jabberServer = (window.location.hostname.indexOf("localhost") !== -1 || window.location.hostname.indexOf("qa") !== -1) ? "qawsfb-jabber.mlb.com" : "wsfb-jabber.mlb.com",
		BOSH_SERVICE = "http://"+_jabberServer+":7070/http-bind/",
		botMessageVO = require("bot/vo/BotMessageVO"),
		eventEnums = require("enums/EventEnums"),
		botEnums = require("enums/BotCommandEnums"),
		controller = require("controller/FantasyDraftController"),
		_connection = null,
		_jidResource = "Smack",
		_password = "G0ss@g3",
		_connections = {"chat":"", "bot":""},
		_leagueID,
		_managerID;

	function FantasyDraftBot() {
		if(instance !== null){
			throw new Error("Cannot instantiate more than one FantasyDraftBot, use FantasyDraftBot.getInstance()");
		}
	}

	function rawInput(data) {
		var messages = $.ensureArray($.xml2json(data).message);
		for(var i=0,l=messages.length;i<l;i++) {
			var messageVO = new botMessageVO();
			messageVO.setData(messages[i]);
			if(messageVO.getType() === "groupchat" && messageVO.getFrom() !== "chatroom") {
				//render in group chat window
				controller.dispatchEvent(botEnums.RENDER_NEW_CHAT_MESSAGE, [ messageVO ]);
			} else if (messageVO.getType() === "command") {
				//parse bot command
				var msgParams = messageVO.getBody().split(" ");
				var commandName = msgParams.shift();
				switch(commandName) {
					case "q-set":
						//q-set ok/failed
						//check if q-set failed
						if(msgParams[0] === "failed") {
							instance.sendBotMessage("q-list");
						}
						break;
					case "q-list":
						controller.dispatchEvent(botEnums.RENDER_Q_LIST, [ msgParams.join(" ") ]);
						break;
					case "autopick-list":
						//autopick-list 1260 1261 1262 1263 ...
						controller.dispatchEvent(botEnums.SET_AUTO_PICK_LIST, [ msgParams.join(" ") ]);
						instance.sendBotMessage("autopick-off "+controller.getManagerID());
						break;
					case "autopick-on":
						//autopick-on 1245 [managerID] 0 [pickSecs]
						var teamID = msgParams[0];
						var pickSecs = +msgParams[1];
						controller.dispatchEvent(botEnums.SET_AUTO_PICK_ON, [ teamID ]);
						//if draft is live and manager is on the clock
						if(controller.getDraftIsLive() && !isNaN(pickSecs)) {
							if(pickSecs < 0) {
								controller.dispatchEvent(botEnums.SET_CLOCK, [ 0 ]);
							} else {
								controller.dispatchEvent(botEnums.SET_CLOCK, [ pickSecs ]);
							}
						}
						break;
					case "autopick-off":
						//autopick-off 1245 [managerID] 0 [pickSecs]
						var teamID = msgParams[0];
						var pickSecs = +msgParams[1];
						controller.dispatchEvent(botEnums.SET_AUTO_PICK_OFF, [ teamID ]);
						//if draft is live and manager is on the clock
						if(controller.getDraftIsLive() && !isNaN(pickSecs)) {
							if(pickSecs < 0) {
								controller.dispatchEvent(botEnums.SET_CLOCK, [ 0 ]);
							} else {
								controller.dispatchEvent(botEnums.SET_CLOCK, [ pickSecs ]);
							}
						}
						break;
					case "time-to-start":
						//time-to-start 1209 [seconds until draft starts (or 0 if draft is live)]
						var secondsUntilDraftStart = +msgParams[0];
						if(secondsUntilDraftStart > 0) {
							//pre-draft
							controller.setDraftIsLive(false);
							controller.dispatchEvent(eventEnums.SHOW_DRAFT_ORDER_DIALOG);
							controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "DRAFT BEGINS IN:" ]);
							controller.dispatchEvent(botEnums.SET_CLOCK, [ secondsUntilDraftStart ]);
						} else {
							//live
							controller.setDraftIsLive(true);
							//check to see if we've missed any picks since loading drafted lookup
							var lastOverallPick = controller.getDrafted().getOverallLastPick();
							if(lastOverallPick !== -1) {
								var numPicksToFetch = 4;
								if(lastOverallPick >= (numPicksToFetch+1)) {
									instance.sendBotMessage("picks-since-position "+(lastOverallPick-numPicksToFetch));
								} else {
									instance.sendBotMessage("picks-since-position 1");
								}
							}
							//find out how much time current manager on the clock has
							instance.sendBotMessage("time-to-pick");
						}
						controller.dispatchEvent(botEnums.TIME_TO_START_RECEIVED);
						break;
					case "picks-since-position":
						//picks-since-position 35 461314 OF 446334 3B 516782 OF 452254 OF 493316 OF 457763 C
						var overallPick = +msgParams.shift();
						for(var i=0,l=msgParams.length;i<l;i++) {
							if(i%2!==0) {
								continue;
							}
							var draftPickData = controller.getDrafted().getPickDataByOverallPickNum(overallPick);
							//check if the player hasn't been drafted yet before adding him
							if(typeof controller.getDrafted().getDraftedPlayerByPlayerID(msgParams[i]) === "undefined") {
								controller.getDrafted().setPlayerDrafted(msgParams[i], msgParams[i+1], draftPickData.managerID, draftPickData.round, draftPickData.pick, true);
							}
							overallPick++;
						}
						break;
					case "time-to-pick":
						//time-to-pick 30
						controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "ON THE CLOCK:" ]);
						controller.dispatchEvent(botEnums.SET_CLOCK, [ +msgParams[0] ]);
						break;
					case "pick-start":
						//pick-start 1239 [managerID] 5 [seconds to pick] 1237 [managerID on deck] 1 [round] 4 [pick]
						controller.setDraftIsLive(true);
						controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "ON THE CLOCK:" ]);
						controller.dispatchEvent(botEnums.SET_CLOCK, [ +msgParams[1] ]);
						//set manager on the clock
						controller.getDrafted().setManagerOnTheClock(msgParams[0]);
						controller.dispatchEvent(botEnums.MANAGER_ON_THE_CLOCK, [ msgParams[0] ]);
						break;
					case "pick-made":
						//pick-made 151 [overall pick] 1256 [managerID] 451594 [playerID] Bn [position on manager's roster] OF [primary position]
						controller.setDraftIsLive(true);
						var numManagers = controller.getLeague().getNumManagers();
						var round = Math.ceil(Number(msgParams[0])/numManagers);
						var pick = Number(msgParams[0])%numManagers;
						if(pick === 0) pick = numManagers;
						controller.getDrafted().setPlayerDrafted(msgParams[2], msgParams[3], msgParams[1], round, pick);
						break;
					case "end-draft":
						controller.setDraftIsLive(false);
						controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "DRAFT IS OVER" ]);
						controller.dispatchEvent(botEnums.SHOW_POST_DRAFT_DIALOG);
						//kill the connection (in 15 minutes)
						setTimeout(function(){
							_connection.disconnect();
						}, 15 * 60 * 1000);
						break;
				}
			}
		}
	}

	function rawOutput(data) {}

	function onConnect(status) {
		if (status == Strophe.Status.CONNECTED) {
	    	//send presence to jabber to mark as "online/available"
			_connection.send($pres());
			_connection.send($pres({to: _connections["bot"], type: "subscribed"}));
			_connection.send($pres({to: _connections["bot"]}));

			//join the chat room so we can talk to the bot
			_connection.muc.join(_connections["chat"], "guest"+_managerID, null, null, null, _password);

			//fire initial commands to figure out draft state
			instance.sendBotMessage("time-to-start");
			instance.sendBotMessage("autopick-list");
			instance.sendBotMessage("q-list");
	    }
	}

	function connect() {
		_connection = new Strophe.Connection(BOSH_SERVICE);
	    _connection.rawInput = rawInput;
	    _connection.rawOutput = rawOutput;

	    _connection.connect("m"+_managerID+"@"+_jabberServer+"/"+_jidResource, _password, onConnect);
	}

	FantasyDraftBot.prototype = {
		init: function(leagueID, managerID) {
			_leagueID = leagueID;
			_managerID = managerID;
			_connections["chat"] = "c"+leagueID+"@conference."+_jabberServer;
			_connections["bot"] = "b"+leagueID+"@"+_jabberServer+"/"+_jidResource;

			connect();
		},
		sendChatMessage: function(msg) {
			_connection.muc.message(_connections["chat"], null, msg);
		},
		sendBotMessage: function(msg) {
			var reply = $msg({to: _connections["bot"], type: "chat"}).c("body").t(msg);
			_connection.send(reply.tree());
		}
	};

	FantasyDraftBot.getInstance = function() {
		// Gets an instance of the singleton. It is better to use
		if(instance === null){
			instance = new FantasyDraftBot();
		}
		return instance;
	};
	
	$.bindable(FantasyDraftBot.prototype);

	return FantasyDraftBot.getInstance();
});