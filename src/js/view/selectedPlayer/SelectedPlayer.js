define("view/selectedPlayer/SelectedPlayer", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		dataPathManager = require("data/DataPathManager"),
		eventEnums = require("enums/EventEnums");

	return AbstractFantasyDraftView.extend({
		label: "selected player",
		currentlySelectedPlayerID: null,
		addViewListeners: function() {
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
		handlePlayerSelected: function(evt, args) {
			this.currentlySelectedPlayerID = args.playerID;
			var playerData = controller.getPlayerRoster().getPlayerByID(this.currentlySelectedPlayerID);

			//assume add to queue is enabled
			this.element.find("#add-to-queue-btn").removeClass("disabled");

			//assume draft btn is enabled
			this.element.find("#draft-btn").removeClass("disabled");
			if(playerData.getIsDrafted()) {
				this.element.find("#draft-btn").addClass("disabled");
				var draftedPlayerVO = controller.getDrafted().getDraftedPlayerByPlayerID(playerData.getPlayerID());
				var managerData = controller.getLeague().getManagerByID(draftedPlayerVO.getOwnerID());
				this.element.find("span.drafted-by").html("<b>Drafted By:</b> "+managerData.getName()).show();
			} else {
				this.element.find("span.drafted-by").hide();
			}
			
			//fetch the player queue to check if we should disable the add to queue button
			controller.unbind(eventEnums.SEND_PLAYER_QUEUE);
			controller.bind(eventEnums.SEND_PLAYER_QUEUE, $.proxy(function(evt, args) {
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
			this.element.find(".positions").html("<b>Qualifies at:</b> "+playerData.getQualifiedPositions().join(", "));

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

			//set news/injury icon paths after tpl has rendered (hacky)
			//this.element.find("img.icon.injury").attr("src", dataPathManager.getImagePath("injury-report-icon.png"));
			//this.element.find("img.icon.news").attr("src", dataPathManager.getImagePath("news-icon.png"));

			this.connect([{event:eventEnums.PLAYER_GRID_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_QUEUE_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.DRAFT_RESULTS_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_REMOVED_FROM_QUEUE, handler:$.proxy(this.handlePlayerRemovedFromQueue, this)},
						  {event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)}]);

			this.addViewListeners();
		}
	}).prototype;
});