define("view/playerQueue/PlayerQueue", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		templatelib = require("model/TemplateLibrary"),
		dataPathManager = require("data/DataPathManager"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		_queue = [];

	return AbstractFantasyDraftView.extend({
		label: "player queue",
		numViewableRows: 10,
		handleAddRemoveButtons: function(selectedPlayerIndex) {
			var moveUpButton = this.element.find(".footer #move-up-btn");
			var moveDownButton = this.element.find(".footer #move-down-btn");
			if(selectedPlayerIndex > 0) {
				moveUpButton.removeClass("disabled");
			} else {
				moveUpButton.addClass("disabled");
			}
			if((selectedPlayerIndex+1) < _queue.length) {
				moveDownButton.removeClass("disabled");
			} else {
				moveDownButton.addClass("disabled");
			}
		},
		addViewListeners: function() {
			var that = this;
			//player queue row clicks
			$(document).on("click", this.__targetDiv + " table tbody tr", function(e) {
				var playerRow = $(this);
				var rowIdx = playerRow.index();
				if(playerRow.hasClass("empty")) {
					return false;
				}
				if(playerRow.hasClass("selected")) {
					playerRow.removeClass("selected");
					that.element.find(".footer .button").addClass("disabled");
				} else {
					that.element.find("table tbody tr").removeClass("selected");
					playerRow.addClass("selected");
					//enable remove action button
					that.element.find(".footer #remove-btn").removeClass("disabled");
					//check if we should enable moveup/movedown
					that.handleAddRemoveButtons(rowIdx);
				}
				controller.dispatchEvent(eventEnums.PLAYER_QUEUE_PLAYER_SELECTED, [ {playerID: playerRow.attr("data-pid") } ]);
			});

			//move player up button click
			$(document).on("click", this.__targetDiv + " .footer #move-up-btn", function(e) {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var selectedPlayer = that.element.find("table tbody tr.selected");
				var selectedPlayerRank = +selectedPlayer.find("td:eq(0)").html();
				selectedPlayerRank--;
				var previousPlayerRank = selectedPlayerRank+1;
				
				selectedPlayer.find("td:eq(0)").html(selectedPlayerRank);
				selectedPlayer.prev().find("td:eq(0)").html(previousPlayerRank).end().before(selectedPlayer);

				that.handleAddRemoveButtons(selectedPlayer.index());
			});

			//move player down button click
			$(document).on("click", this.__targetDiv + " .footer #move-down-btn", function(e) {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var selectedPlayer = that.element.find("table tbody tr.selected");
				var selectedPlayerRank = +selectedPlayer.find("td:eq(0)").html();
				selectedPlayerRank++;
				var previousPlayerRank = selectedPlayerRank-1;
				
				selectedPlayer.find("td:eq(0)").html(selectedPlayerRank);
				selectedPlayer.next().find("td:eq(0)").html(previousPlayerRank).end().after(selectedPlayer);

				that.handleAddRemoveButtons(selectedPlayer.index());
			});

			//remove player button click
			$(document).on("click", this.__targetDiv + " .footer #remove-btn", function(e) {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var playerID = that.element.find("table tbody tr.selected").attr("data-pid");

				//dispatch player removed (for selected player)
				controller.dispatchEvent(eventEnums.PLAYER_REMOVED_FROM_QUEUE, [ {playerID: playerID} ]);

				that.element.find(".footer .button").addClass("disabled");
				
				_queue.splice(_queue.indexOf(playerID), 1);
				that.renderQueue();
			});
		},
		renderQueue: function(isAddPlayerToQueue) {
			var tbody = this.element.find("table tbody");
			tbody.empty();
			var len = (_queue.length < this.numViewableRows) ? this.numViewableRows: _queue.length;
			if(len <= this.numViewableRows) {
				this.element.find("table").addClass("no-scroll");
			} else {
				this.element.find("table").removeClass("no-scroll");
			}
			for(var i=0,l=len;i<l;i++) {
				var playerData = (typeof _queue[i] === "undefined") ? {index:i} : {index:i, player: controller.getPlayerRoster().getPlayerByID(_queue[i])};
				tbody.append($.template(templatelib.getTemplateByID(templateEnums.PLAYER_QUEUE_ROW), playerData, true));
			}
			//auto-scroll to bottom (if there's more than 10 players)
			if(_queue.length > this.numViewableRows && isAddPlayerToQueue) {
				tbody.scrollTop(tbody[0].scrollHeight);
			}
		},
		handleRequestPlayerQueue: function(evt, args) {
			controller.dispatchEvent(eventEnums.SEND_PLAYER_QUEUE, [ {playerQueue: _queue} ]);
		},
		handleAddPlayerToQueue: function(evt, args) {
			//check to make sure player doesn't already exist before adding him
			if(_queue.indexOf(args.playerID) === -1) {
				_queue.push(args.playerID);

				this.renderQueue(true);
			}
		},
		handlePlayerSelected: function(evt, args) {
			this.element.find("table tbody tr").removeClass("selected");
			this.element.find(".footer .button").addClass("disabled");
		},
		handlePlayerDrafted: function(evt, args) {
			var draftedPlayer = args;
			if(_queue.indexOf(draftedPlayer.getPlayerID()) !== -1) {
				this.element.find(".footer .button").addClass("disabled");
				
				_queue.splice(_queue.indexOf(draftedPlayer.getPlayerID()), 1);
				this.renderQueue();
			}
		},
		init: function(div, template) {
			this._super(div, template);

			var handlePlayerSelectedFunction = $.proxy(this.handlePlayerSelected, this);

			this.connect([{event:eventEnums.REQUEST_PLAYER_QUEUE, handler:this.handleRequestPlayerQueue},
						  {event:eventEnums.ADD_PLAYER_TO_QUEUE, handler:$.proxy(this.handleAddPlayerToQueue, this)},
						  {event:eventEnums.PLAYER_GRID_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.DRAFT_RESULTS_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)}]);

			this.addViewListeners();

			//render empty queue
			this.renderQueue();
		}
	}).prototype;
});