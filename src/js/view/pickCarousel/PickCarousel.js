define("view/pickCarousel/PickCarousel", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		dataPathManager = require("data/DataPathManager"),
		templatelib = require("model/TemplateLibrary"),
		controller = require("controller/FantasyDraftController"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		botEnums = require("enums/BotCommandEnums"),
		bot = require("bot/FantasyDraftBot"),
		_managerOnTheClock,
		$timer,
		_timer,
		_incrementTime = 100,
		_currentTime;

	// Common timer functions
	function pad(number, length) {
	    var str = '' + number;
	    while (str.length < length) {str = '0' + str;}
	    return str;
	}
	function formatTime(time) {
	    time = time / 10;
	    var min = parseInt(time / 6000),
	        sec = parseInt(time / 100) - (min * 60);
	    return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
	}

	return AbstractFantasyDraftView.extend({
		label: "pick carousel",
		currentRound: 1,
		addViewListeners: function() {
			var that = this;
			//handler for autopick checkbox
			$(document).on("change", this.__targetDiv + " #auto-pick input", function(e) {
				var _myTeamID = controller.getManagerID();
				var isAutoDraft = $(this).prop("checked");
				that.updateManagerAutoDraft(_myTeamID, isAutoDraft);
				//let the bot know the client wants to auto-draft (or not)
				if(isAutoDraft) {
					bot.sendBotMessage("autopick-on "+_myTeamID);
				} else {
					bot.sendBotMessage("autopick-off "+_myTeamID);
				}
			});
		},
		initTimer: function() {
			$timer = $(this.__targetDiv + " #clock");
			_timer = $.timer($.proxy(this.updateTimer, this), _incrementTime);
		},
		updateTimer: function() {
			$timer.html(formatTime(_currentTime));

			//if the timer has ended 
			if(_currentTime === 0) {
	            _timer.stop();
	            return;
	        }

	        // Increment timer position
	        _currentTime -= _incrementTime;
	        if (_currentTime < 0) _currentTime = 0;
		},
		handleSetClock: function(evt, args) {
			_currentTime = args * 1000;
			_timer.play(true);
		},
		handleSetClockHeader: function(evt, args) {
			this.element.find("#timer-area #header").html(args);
			if(args === "DRAFT IS OVER") {
				//kill the timer
				_timer.stop();
				$timer.html("00:00");
				//render last player (in case someone comes in post-draft state)
				this.renderLastPlayerPickedTicker();
			}
		},
		handleAutopickOn: function(evt, args) {
			this.updateManagerAutoDraft(args, true);
		},
		handleAutopickOff: function(evt, args) {
			this.updateManagerAutoDraft(args, false);
		},
		handleAutopickList: function(evt, args) {
			var autoPickers = args.split(" ");
			for(var i=0,l=autoPickers.length;i<l;i++) {
				if(autoPickers[i] !== "") this.updateManagerAutoDraft(autoPickers[i], true);
			}
		},
		updateManagerAutoDraft: function(managerID, isAutoDraft) {
			var _myTeamID = controller.getManagerID();
			if(isAutoDraft) {
				this.element.find('li[data-id="'+managerID+'"] img.auto-draft-icon').removeClass("hidden").parent().attr("data-auto-draft", true);
				if(managerID === _myTeamID) {
					$("#auto-pick input").prop("checked", true);
				}
			} else {
				this.element.find('li[data-id="'+managerID+'"] img.auto-draft-icon').addClass("hidden").parent().attr("data-auto-draft", false);
				if(managerID === _myTeamID) {
					$("#auto-pick input").prop("checked", false);
				}
			}
		},
		updatePickCarousel: function() {
			//check if we're entering a new round
			if(this.element.find("li:eq(2)").hasClass("round-marker")) {
				//update visible round marker
				this.currentRound++;
				this.element.find("li:eq(0)").html('Round</br><span class="round-number">'+this.currentRound+'</span>');

				var elemToPop = this.element.find("li:eq(1)").removeClass("on-the-clock");
				elemToPop.find(".round").html("R"+(this.currentRound+1));
				if(this.currentRound < 16) {
					this.element.find("#pick-list").append(elemToPop);
				} else {
					elemToPop.remove();
				}
				elemToPop = this.element.find("li:eq(1)");
				elemToPop.html('Round</br><span class="round-number">'+(this.currentRound+2)+'</span>');
				if(this.currentRound < 15) {
					this.element.find("#pick-list").append(elemToPop);
				} else {
					elemToPop.remove();
				}
				this.element.find("li:eq(1)").addClass("on-the-clock");
			} else {
				var elemToPop = this.element.find("li:eq(1)");
				elemToPop.removeClass("on-the-clock").find(".round").html("R"+(this.currentRound+2));
				if(this.currentRound < 15) {
					this.element.find("#pick-list").append(elemToPop);
				} else {
					elemToPop.remove();
				}
				//check if the draft is over
				if(this.element.find("li:eq(1)").length > 0) {
					this.element.find("li:eq(1)").addClass("on-the-clock");
				} else {
					this.element.find("li:eq(0)").remove();
				}
			}
			//render last player selected a la Bud Selig
			this.renderLastPlayerPickedTicker();
			//render picks until your turn
			this.renderPicksUntilYourTurn();
		},
		handlePlayerDrafted: function(evt) {
			this.updatePickCarousel();
		},
		handleManagerOnTheClock: function(evt, managerID) {
			if(managerID !== $("#pick-list li.on-the-clock").attr("data-id")) {
				this.updatePickCarousel();
			}
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
			if(typeof picksUntilTurn === "undefined") picksUntilTurn = "--";
			this.element.find("#timer-area #picks-until-turn").html("Picks until your turn: "+picksUntilTurn);
		},
		renderPickCarousel: function() {
			_myTeamID = controller.getManagerID();
			var managers = controller.getLeague().getManagers();
			this.currentRound = controller.getDrafted().getCurrentRound();
			var currentPick = controller.getDrafted().getCurrentPick();

			//manipulate managers array to match current state of draft
			if(controller.getDraftIsLive()) {
				if(currentPick !== 1) {
					var lastOwnerToDraft = controller.getDrafted().getLastOwnerToDraft();
					var managersAlreadyDrafted;
					var managersRemaining = [];
					var formattedManagers;
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
			var gearIconPathGrey = dataPathManager.getImagePath("auto-draft-gear-grey.png");
			var gearIconPathWhite = dataPathManager.getImagePath("auto-draft-gear-white.png");
			for(var i=0,l=formattedManagers.length;i<l;i++) {
				if(i===0 && tmpRound !== 17) {
					theList.append('<li class="round-marker fixed">Round</br><span class="round-number">'+tmpRound+'</span>');
				} else if(i > 0 && formattedManagers[i-1].getID() === formattedManagers[i].getID()) {
					tmpRound = tmpRound+1;
					if(tmpRound <= 16) theList.append('<li class="round-marker">Round</br><span class="round-number">'+tmpRound+'</span>');
					currentPick = 1;
				}
				var teamLi = $('<li data-id="'+formattedManagers[i].getID()+'" data-auto-draft="false"></li>').html($.template(templatelib.getTemplateByID(templateEnums.PICK_CAROUSEL_TEAM), {teamName: formattedManagers[i].getName(),round: tmpRound, pick: currentPick, gearIconPathGrey: gearIconPathGrey, gearIconPathWhite: gearIconPathWhite}, true));
				if(formattedManagers[i].getID() === controller.getManagerID()) {
					teamLi.addClass("my-team");
				}
				if(i===0) {
					teamLi.addClass("on-the-clock");
				}
				if(tmpRound <= 16) theList.append(teamLi);
				currentPick++;
				if(i===l-1 && formattedManagers[0].getID() === formattedManagers[l-1].getID() && tmpRound !== 18) {
					tmpRound = tmpRound+1;
					theList.append('<li class="round-marker">Round</br><span class="round-number">'+tmpRound+'</span>');
				}
			}
			//render picks until your turn
			this.renderPicksUntilYourTurn();
		},
		handleTimeToStartReceived: function(evt, args) {
			this.renderPickCarousel();
		},
		init: function(div, template) {
			this._super(div, template);

			//pass image path of gear icon to the auto-draft input (hacky)
			this.element.find("img.gear-icon").attr("src", dataPathManager.getImagePath("auto-draft-gear-grey.png"));

			this.connect([{event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)},
						  {event:botEnums.SET_CLOCK, handler:$.proxy(this.handleSetClock, this)},
						  {event:botEnums.SET_CLOCK_HEADER, handler:$.proxy(this.handleSetClockHeader, this)},
						  {event:botEnums.SET_AUTO_PICK_ON, handler:$.proxy(this.handleAutopickOn, this)},
						  {event:botEnums.SET_AUTO_PICK_OFF, handler:$.proxy(this.handleAutopickOff, this)},
						  {event:botEnums.SET_AUTO_PICK_LIST, handler:$.proxy(this.handleAutopickList, this)},
						  {event:botEnums.TIME_TO_START_RECEIVED, handler:$.proxy(this.handleTimeToStartReceived, this)},
						  {event:botEnums.MANAGER_ON_THE_CLOCK, handler:$.proxy(this.handleManagerOnTheClock, this)}]);

			this.addViewListeners();

			this.initTimer();
		}
	}).prototype;
});