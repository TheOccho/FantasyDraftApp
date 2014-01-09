define("view/pickCarousel/PickCarousel", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		dataPathManager = require("data/DataPathManager"),
		templatelib = require("model/TemplateLibrary"),
		controller = require("controller/FantasyDraftController"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		testPlayersDrafted = 0,
		testDraftPlayers = [["545361","OF","347558","1","1"],
							["408234","3B","347548","1","2"],
							["461314","OF","347556","1","3"],
							["429664","2B","347557","1","4"],
							["405395","1B","347555","1","5"],
							["471865","OF","347553","1","6"],
							["457705","OF","347554","1","7"],
							["458015","1B","347549","1","8"],
							["453064","SS","347552","1","9"],
							["425902","1B","347550","1","10"],
							["430832","OF","347559","1","11"],
							["519317","OF","347551","1","12"]];

	return AbstractFantasyDraftView.extend({
		label: "pick carousel",
		currentRound: 1,
		addViewListeners: function() {
			$(document).on("click", this.__targetDiv + " #timer-area", function(e) {
				controller.getDrafted().setPlayerDrafted(testDraftPlayers[testPlayersDrafted][0], testDraftPlayers[testPlayersDrafted][1], testDraftPlayers[testPlayersDrafted][2], testDraftPlayers[testPlayersDrafted][3], testDraftPlayers[testPlayersDrafted][4]);
				testPlayersDrafted++;
			});
		},
		updatePickCarousel: function() {
			//check if we're entering a new round
			if(this.element.find("li:eq(2)").hasClass("round-marker")) {
				//update visible round marker
				this.currentRound++;
				this.element.find("li:eq(0)").html('Round</br><span class="round-number">'+this.currentRound+'</span>');

				var elemToPop = this.element.find("li:eq(1)").removeClass("on-the-clock");
				elemToPop.find(".round").html("R"+(this.currentRound+1));
				this.element.find("#pick-list").append(elemToPop);
				elemToPop = this.element.find("li:eq(1)");
				elemToPop.html('Round</br><span class="round-number">'+(this.currentRound+2)+'</span>');
				this.element.find("#pick-list").append(elemToPop);

				this.element.find("li:eq(1)").addClass("on-the-clock");
			} else {
				var elemToPop = this.element.find("li:eq(1)");
				elemToPop.removeClass("on-the-clock").find(".round").html("R"+(this.currentRound+2));
				this.element.find("#pick-list").append(elemToPop);
				this.element.find("li:eq(1)").addClass("on-the-clock");
			}
			//render last player selected a la Bud Selig
			this.renderLastPlayerPickedTicker();
			//render picks until your turn
			this.renderPicksUntilYourTurn();
		},
		handlePlayerDrafted: function(evt, args) {
			this.updatePickCarousel();
		},
		renderLastPlayerPickedTicker: function() {
			var lastPickFormatted = controller.getDrafted().getOverallLastPick(true);
			var lastPickTeamName = controller.getLeague().getManagerByID(controller.getDrafted().getLastOwnerToDraft()).getName();
			var lastPickPlayer = controller.getPlayerRoster().getPlayerByID(controller.getDrafted().getLastPlayerDrafted());
			this.element.find("#last-pick-ticker span.info").html("With the "+lastPickFormatted+" overall pick, "+lastPickTeamName+" selects "+lastPickPlayer.getFullName()+" ("+lastPickPlayer.getTeamAbbrev().toUpperCase()+", "+lastPickPlayer.getPrimaryPosition()+")");
		},
		renderPicksUntilYourTurn: function() {
			var justPicksList = this.element.find("ul li:not(.round-marker)");
			var picksUntilTurn;
			for(var i=0,l=justPicksList.length;i<l;i++) {
				var tmpTeam = $(justPicksList[i]);
				if(tmpTeam.hasClass("my-team")) {
					picksUntilTurn = i;
					break;
				}
			}
			this.element.find("#timer-area #picks-until-turn").html("Picks until your turn: "+picksUntilTurn);
		},
		handleDraftedDataLoaded: function(evt, args) {
			var _myTeamID = controller.getManagerID();
			var managers = controller.getLeague().getManagers();
			this.currentRound = controller.getDrafted().getCurrentRound();
			var currentPick = controller.getDrafted().getCurrentPick();

			//manipulate managers array to match current state of draft
			if(controller.getDraftHasBegun()) {
				if(currentPick !== 1) {
					var lastOwnerToDraft = controller.getDrafted().getLastOwnerToDraft();
					var managersAlreadyDrafted;
					var managersRemaining = [];
					var formmattedManagers;
					var ownerFound = false;
					if(this.currentRound%2 === 0) {
						managers.reverse();
					}
					for(var i=0,l=managers.length;i<l;i++) {
						if(managers[i].getID() === lastOwnerToDraft) {
							ownerFound = true;
							managersAlreadyDrafted = managers.slice(0,i+1);
							continue;
						}
						if(ownerFound) {
							managersRemaining.push(managers[i]);
						}
					}
					formattedManagers = [].concat(managersRemaining).concat(managersRemaining.reverse()).concat(managersAlreadyDrafted.reverse()).concat(managersAlreadyDrafted.reverse());
				} else {
					if(this.currentRound%2 === 0) {
						formattedManagers = [].concat(managers.reverse()).concat(managers.reverse());
					} else {
						formattedManagers = [].concat(managers).concat(managers.reverse());
					}
				}
				//render last player selected a la Bud Selig
				this.renderLastPlayerPickedTicker();
			} else {
				formattedManagers = [].concat(managers).concat(managers.reverse());
			}

			var theList = this.element.find("ul");
			var tmpRound = this.currentRound;
			var gearIconPath = dataPathManager.getImagePath("auto-draft-gear.png");
			for(var i=0,l=formattedManagers.length;i<l;i++) {
				if(i===0) {
					theList.append('<li class="round-marker fixed">Round</br><span class="round-number">'+tmpRound+'</span>');
				} else if(i > 0 && formattedManagers[i-1].getID() === formattedManagers[i].getID()) {
					tmpRound = tmpRound+1;
					theList.append('<li class="round-marker">Round</br><span class="round-number">'+tmpRound+'</span>');
					currentPick = 1;
				}
				var teamLi = $('<li data-id="'+formattedManagers[i].getID()+'"></li>').html($.template(templatelib.getTemplateByID(templateEnums.PICK_CAROUSEL_TEAM), {teamName: formattedManagers[i].getName(),round: tmpRound, pick: currentPick, gearIconPath: gearIconPath}, true));
				if(formattedManagers[i].getID() === _myTeamID) {
					teamLi.addClass("my-team");
				}
				if(i===0) {
					teamLi.addClass("on-the-clock");
				}
				theList.append(teamLi);
				currentPick++;
				if(i===l-1 && formattedManagers[0].getID() === formattedManagers[l-1].getID()) {
					tmpRound = tmpRound+1;
					theList.append('<li class="round-marker">Round</br><span class="round-number">'+tmpRound+'</span>');
				}
			}
			//render picks until your turn
			this.renderPicksUntilYourTurn();
		},
		init: function(div, template) {
			this._super(div, template);

			this.connect([{event:eventEnums.DRAFTED_DATA_LOADED, handler:$.proxy(this.handleDraftedDataLoaded, this)},
						  {event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)}]);

			this.addViewListeners();
		}
	});
});