define("bot/FantasyDraftBot", function( require, exports, module ) {
	var instance = null,
		BOSH_SERVICE = "http://d1engbuild01.dev.mlbam.com:7070/http-bind/",
		botMessageVO = require("bot/vo/BotMessageVO"),
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
		//console.log("rawInput: "+data);
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
					case "start-draft":
						break;
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
						var from = msgParams[1];
						controller.dispatchEvent(botEnums.SET_AUTO_PICK_ON, [ teamID ]);
						break;
					case "autopick-off":
						//autopick-off 1245 [managerID] 0 [pickSecs]
						var teamID = msgParams[0];
						var from = msgParams[1];
						controller.dispatchEvent(botEnums.SET_AUTO_PICK_OFF, [ teamID ]);
						break;
					case "time-to-start":
						//time-to-start 1209 [seconds until draft starts (or 0 if draft is live)]
						var secondsUntilDraftStart = +msgParams[0];
						if(secondsUntilDraftStart > 0) {
							//pre-draft
							controller.setDraftIsLive(false);
							controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "DRAFT BEGINS IN:" ]);
							controller.dispatchEvent(botEnums.SET_CLOCK, [ secondsUntilDraftStart ]);
						} else {
							//live
							controller.setDraftIsLive(true);
							instance.sendBotMessage("time-to-pick");
						}
						controller.dispatchEvent(botEnums.TIME_TO_START_RECEIVED);
						break;
					case "time-to-pick":
						//time-to-pick 30
						controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "ON THE CLOCK:" ]);
						controller.dispatchEvent(botEnums.SET_CLOCK, [ +msgParams[0] ]);
						break;
					case "current-pick-number":
						break;
					case "current-pick-team":
						break;
					case "pick-start":
						//pick-start 1239 [managerID] 5 [seconds to pick] 1237 [managerID on deck] 1 [round] 4 [pick]
						controller.setDraftIsLive(true);
						controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "ON THE CLOCK:" ]);
						controller.dispatchEvent(botEnums.SET_CLOCK, [ +msgParams[1] ]);
						controller.dispatchEvent(botEnums.MANAGER_ON_THE_CLOCK, [ msgParams[0], msgParams[1], msgParams[2], +msgParams[3], +msgParams[4]]);
						break;
					case "pick-made":
						//pick-made 151 [overall pick] 1256 [managerID] 451594 [playerID] Bn [position on manager's roster] OF [primary position]
						controller.setDraftIsLive(true);
						var numManagers = controller.getLeague().getNumManagers();
						var round = Math.ceil(Number(msgParams[0])/numManagers);
						var pick = Number(msgParams[0])%numManagers;
						if(pick === 0) pick = numManagers;
						controller.getDrafted().setPlayerDrafted(msgParams[2], msgParams[4], msgParams[1], round, pick);
						break;
					case "end-draft":
						controller.setDraftIsLive(false);
						controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "DRAFT IS OVER" ]);
						controller.dispatchEvent(botEnums.SHOW_POST_DRAFT_DIALOG);
						break;
				}
			}
		}
	}

	function rawOutput(data) {
		//console.log("rawOuput: "+data);
	}

	function connectToChatRoom() {
		_connection.muc.join(_connections["chat"], "guest"+_managerID, null, null, null, _password);
	}

	function onConnect(status) {
		if (status == Strophe.Status.CONNECTING) {
			//console.log('Strophe is connecting.');
	    } else if (status == Strophe.Status.CONNFAIL) {
			//console.log('Strophe failed to connect.');
	    } else if (status == Strophe.Status.DISCONNECTING) {
			//console.log('Strophe is disconnecting.');
	    } else if (status == Strophe.Status.DISCONNECTED) {
			//console.log('Strophe is disconnected.');
	    } else if (status == Strophe.Status.CONNECTED) {
	    	//console.log('Strophe is connected.');
	    	//send presence to jabber to mark as "online/available"
	    	var presence = $pres();
			_connection.send(presence);

			//join the chat room so we can talk to the bot
			connectToChatRoom();

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

	    _connection.connect("m"+_managerID+"@d1engbuild01.dev.mlbam.com/"+_jidResource, _password, onConnect);
	}

	FantasyDraftBot.prototype = {
		init: function(leagueID, managerID) {
			_leagueID = leagueID;
			_managerID = managerID;
			_connections["chat"] = "c"+leagueID+"@conference.d1engbuild01.dev.mlbam.com";
			_connections["bot"] = "b"+leagueID+"@d1engbuild01.dev.mlbam.com/"+_jidResource;

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