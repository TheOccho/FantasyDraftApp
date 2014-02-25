define("view/selectedPlayer/SelectedPlayer", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		dataPathManager = require("data/DataPathManager"),
		eventEnums = require("enums/EventEnums"),
		botEnums = require("enums/BotCommandEnums"),
		bot = require("bot/FantasyDraftBot"),
		_managerOnTheClock;

	return AbstractFantasyDraftView.extend({
		label: "selected player",
		currentlySelectedPlayerID: null,
		addViewListeners: function() {
			var that = this;
			//playercard link click
			$(document).on("click", this.__targetDiv + " .playercard-link", function(e) {
				var playerID = $(this).attr("data-pid");
				controller.dispatchEvent(eventEnums.SHOW_PLAYER_CARD_DIALOG, [ {playerID: playerID} ]);
			});

			//draft player click
			$(document).on("click", this.__targetDiv + " #draft-btn", function(e) {
				if($(this).hasClass("disabled")) {
					return false;
				}
				//draft player action
				bot.sendBotMessage("pick "+that.currentlySelectedPlayerID);
			});

			//add to queue click
			$(document).on("click", this.__targetDiv + " #add-to-queue-btn", function(e) {
				if($(this).hasClass("disabled")) {
					return false;
				}
				$(this).addClass("disabled");
				controller.dispatchEvent(eventEnums.ADD_PLAYER_TO_QUEUE, [ {playerID: $(this).attr("data-pid")} ]);
			});
		},
		handlePlayerRemovedFromQueue: function(evt, args) {
			if(this.currentlySelectedPlayerID === args.playerID) {
				this.element.find("#add-to-queue-btn").removeClass("disabled");
			}
		},
		handleManagerOnTheClock: function(evt, args) {
			_managerOnTheClock = args;
			if(!this.currentlySelectedPlayerID) {
				return;
			}
			var playerData = controller.getPlayerRoster().getPlayerByID(this.currentlySelectedPlayerID);
			if(!playerData.getIsDrafted() && _managerOnTheClock === controller.getManagerID()) {
				this.element.find("#draft-btn").removeClass("disabled");
			}
		},
		handlePlayerSelected: function(evt, args) {
			this.currentlySelectedPlayerID = args.playerID;
			var playerData = controller.getPlayerRoster().getPlayerByID(this.currentlySelectedPlayerID);

			//assume add to queue is enabled
			this.element.find("#add-to-queue-btn").removeClass("disabled");

			var myTeamID = controller.getManagerID();
			if(controller.getDraftIsLive() && !playerData.getIsDrafted() && (_managerOnTheClock === myTeamID || $("#pick-list li.on-the-clock").attr("data-id") === myTeamID)) {
				this.element.find("#draft-btn").removeClass("disabled");
			}

			//check if the player has been drafted
			if(playerData.getIsDrafted()) {
				this.element.find("#draft-btn").addClass("disabled");
				var draftedPlayerVO = controller.getDrafted().getDraftedPlayerByPlayerID(playerData.getPlayerID());
				var managerData = controller.getLeague().getManagerByID(draftedPlayerVO.getOwnerID());
				var managerName = (managerData.getName().length > 20) ? managerData.getName().substr(0, 20)+"..." : managerData.getName();
				this.element.find("span.drafted-by").html("<b>Drafted By:</b> "+managerName).show();
			} else {
				this.element.find("span.drafted-by").hide();
			}
			
			//fetch the player queue to check if we should disable the add to queue button
			controller.one(eventEnums.SEND_PLAYER_QUEUE, $.proxy(function(evt, args) {
				//check if player exists in queue OR if he's been drafted
				if(args.playerQueue.indexOf(this.currentlySelectedPlayerID) !== -1 || playerData.getIsDrafted()) {
					this.element.find("#add-to-queue-btn").addClass("disabled");
				}
			}, this));
			controller.dispatchEvent(eventEnums.REQUEST_PLAYER_QUEUE);

			//set playerID on buttons
			this.element.find("#draft-btn").attr("data-pid", this.currentlySelectedPlayerID);
			this.element.find("#add-to-queue-btn").attr("data-pid", this.currentlySelectedPlayerID);

			//update mugshot
			if(playerData.getType() === "hitter") {
				this.element.find("img.mugshot").attr("src", "http://gdx.mlb.com/images/gameday/mugshots/mlb/"+this.currentlySelectedPlayerID+".jpg");
			} else if(playerData.getType() === "pitcher") {
				this.element.find("img.mugshot").attr("src", "http://mlb.mlb.com/mlb/fantasy/wsfb/images/mugshots/"+playerData.getTeamAbbrev()+"_staff_62x75.jpg");
			}

			//update player name
			this.element.find(".player-name").html(playerData.getFullName());

			//update team name
			this.element.find(".team-name").html("<b>Team:</b> "+playerData.getTeamAbbrev().toUpperCase());

			//update qualified positions
			(playerData.getQualifiedPositions().length < 4) ? this.element.find(".positions").html("<b>Qualifies at:</b> "+playerData.getQualifiedPositions().join(", ")) : this.element.find(".positions").html("<b>Qual. at:</b> "+playerData.getQualifiedPositions().join(", "));

			//set (and show) player link
			this.element.find(".playercard-link").attr("data-pid", this.currentlySelectedPlayerID).show();

			//set table stats
			this.element.find("table td.last").html(playerData.getLastYearStats().getPoints());
			this.element.find("table td.proj").html(playerData.getProjectedStats().getPoints());
			this.element.find("table td.avg").html(playerData.getThreeYearAvgStats().getPoints());
		},
		handlePlayerDrafted: function(evt, args) {
			var playerDrafted = args;
			//selected player has been drafted, kill draft and add to queue buttons
			if(this.currentlySelectedPlayerID === playerDrafted.getPlayerID()) {
				this.element.find("#draft-btn").addClass("disabled");
				this.element.find("#add-to-queue-btn").addClass("disabled");
			}
		},
		init: function(div, template) {
			this._super(div, template);

			var handlePlayerSelectedFunction = $.proxy(this.handlePlayerSelected, this);

			this.connect([{event:eventEnums.PLAYER_GRID_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_QUEUE_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.DRAFT_RESULTS_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_REMOVED_FROM_QUEUE, handler:$.proxy(this.handlePlayerRemovedFromQueue, this)},
						  {event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)},
						  {event:botEnums.MANAGER_ON_THE_CLOCK, handler:$.proxy(this.handleManagerOnTheClock, this)}]);

			this.addViewListeners();
		}
	}).prototype;
});