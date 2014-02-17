define("view/draftResults/DraftResults", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		templatelib = require("model/TemplateLibrary"),
		dataPathManager = require("data/DataPathManager"),
		controller = require("controller/FantasyDraftController"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums");

	return AbstractFantasyDraftView.extend({
		label: "draft results",
		currentFilter: "team",
		positions: ["c","1b","2b","ss","3b","of","of","of","u","p","bn","bn","bn","bn","bn","bn"],
		addViewListeners: function() {
			var that = this;
			//filter results by type tab click
			$(document).on("click", this.__targetDiv + " #results-filter li.tab", function(e) {
				var filterClicked = $(this);
				if(filterClicked.attr("data-id") === that.currentFilter) {
					return false;
				}
				that.currentFilter = filterClicked.attr("data-id");
				that.element.find("#results-filter li.tab").removeClass("selected");
				filterClicked.addClass("selected");

				//hide all views
				that.element.find(".wrapper div.view").hide();
				that.element.find(".wrapper #" + that.currentFilter + "-view").show();

				if(that.currentFilter === "team") {
					//get my team ID and force team view to default to me
					var myTeamID = controller.getManagerID();
					$("#team-view select").val(myTeamID);
					that.renderTeamTableByOwnerID(myTeamID);
				} else if(that.currentFilter === "round") {
					//clear out and update round drop-down
					var roundDropdown = that.element.find("#round-select");
					roundDropdown.empty();
					var currentRound = controller.getDrafted().getCurrentRound();
					//check if the draft has ended
					if(currentRound === 17) currentRound = 16;
					for(var i=1,l=currentRound;i<=l;i++) {
						roundDropdown.append('<option value="'+i+'">Round '+i+'</option>');
					}
					//select latest round
					roundDropdown.val(currentRound);

					//render the current round of players drafted
					that.renderRoundTable(currentRound, true);
				} else if(that.currentFilter === "tally") {
					//render the tally table
					that.renderTallyTable();
				}
			});

			//change filter by team drop-down
			$(document).on("change", this.__targetDiv + " #team-view select", function(e) {
				var selectedManagerID = $(this).val();
				that.renderTeamTableByOwnerID(selectedManagerID);
			});

			//change filter by round drop-down
			$(document).on("change", this.__targetDiv + " #round-view select", function(e) {
				var selectedRound = $(this).val();
				that.renderRoundTable(selectedRound);
			});

			//player row clicks
			$(document).on("click", this.__targetDiv + " table tbody tr", function(e) {
				var playerRow = $(this);
				if(playerRow.hasClass("empty")) {
					return false;
				}
				if(playerRow.hasClass("selected")) {
					playerRow.removeClass("selected");
				} else {
					that.element.find("table tbody tr").removeClass("selected");
					playerRow.addClass("selected");
				}
				controller.dispatchEvent(eventEnums.DRAFT_RESULTS_PLAYER_SELECTED, [ {playerID: playerRow.attr("data-pid")} ]);
			});
		},
		handleManagerDataLoaded: function(evt, args) {
			var myTeamID = controller.getManagerID();
			var managers = controller.getLeague().getManagers();
			var managerDropdownElement = this.element.find("#"+this.currentFilter+"-view select");
			for(var i=0,l=managers.length;i<l;i++) {
				if(managers[i].getID() === myTeamID) {
					managerDropdownElement.find("option:eq(0)").attr("value", myTeamID);
				} else {
					managerDropdownElement.append('<option value="' + managers[i].getID() + '">' + managers[i].getName() +'</option>');
				}
			}
		},
		handleDraftedDataLoaded: function(evt, args) {
			this.renderTeamTableByOwnerID(controller.getManagerID());
		},
		renderTeamTableByOwnerID: function(ownerID) {
			//clear out old table and attach a new blank one
			var teamViewTable = this.element.find("#team-view div.table-wrapper");
			teamViewTable.html($.template(templatelib.getTemplateByID(templateEnums.DRAFT_RESULTS_TEAM_TABLE), {}, true));

			var myDraftedPlayers = controller.getDrafted().getDraftedPlayersByOwnerID(ownerID);
			if(typeof myDraftedPlayers === "undefined") {
				return;
			}
			for(var i=0,l=myDraftedPlayers.length;i<l;i++) {
				var player = controller.getPlayerRoster().getPlayerByID(myDraftedPlayers[i].getPlayerID());
				this.addPlayerToRow(player, myDraftedPlayers[i].getPosition().toLowerCase());
			}
			//scroll to top
			teamViewTable.scrollTop(0);
		},
		renderRoundTable: function(round, scrollToBottom) {
			//clear out old table and attach a new blank one
			this.element.find("#round-view div.table-wrapper").html($.template(templatelib.getTemplateByID(templateEnums.DRAFT_RESULTS_ROUND_TABLE) , {}, true));
			
			var playersDraftedForRound = controller.getDrafted().getDraftedPlayersByRound(round);
			var tbody = this.element.find("#round-view div.table-wrapper table tbody");
			for(var i=0,l=playersDraftedForRound.length;i<l;i++) {
				tbody.append($.template(templatelib.getTemplateByID(templateEnums.DRAFT_RESULTS_ROUND_ROW), {player: playersDraftedForRound[i], controller: controller}, true));
			}
			//auto-scroll to bottom
			var roundViewTable = this.element.find("#round-view div.table-wrapper");
			if(scrollToBottom) {
				roundViewTable.scrollTop(roundViewTable[0].scrollHeight);
			} else {
				roundViewTable.scrollTop(0);
			}
		},
		renderTallyTable: function() {
			//clear out old table and attach a new blank one
			this.element.find("#tally-view div.table-wrapper").html($.template(templatelib.getTemplateByID(templateEnums.DRAFT_RESULTS_TALLY_TABLE), {}, true));
		
			var managers = controller.getLeague().getManagers();
			var tbody = this.element.find("#tally-view div.table-wrapper table tbody");
			for(var i=0,l=managers.length;i<l;i++) {
				var managerTally = controller.getLeague().getManagerDraftTally(managers[i].getID());
				tbody.append($.template(templatelib.getTemplateByID(templateEnums.DRAFT_RESULTS_TALLY_ROW), {manager: managers[i], tally: managerTally}, true));
			}
			var totalTally = controller.getLeague().getTotalDraftedTally();
			tbody.append('<tr class="totals-row empty"><td>Totals</td><td>'+totalTally["c"]+'</td><td>'+totalTally["1b"]+'</td><td>'+totalTally["2b"]+'</td><td>'+totalTally["ss"]+'</td><td>'+totalTally["3b"]+'</td><td>'+totalTally["of"]+'</td><td>'+totalTally["u"]+'</td><td>'+totalTally["p"]+'</td></tr>');
		},
		getFormattedPlayerCell: function(player) {
			if(player.getPrimaryPosition() === "P") {
				return player.getFirstName() + " " + player.getLastName()+'<br/><span class="player-team-pos">'+player.getTeamAbbrev().toUpperCase()+" - P</span>";
			} else {
				return player.getFirstName().charAt(0) + ". " + player.getLastName()+'<br/><span class="player-team-pos">'+player.getTeamAbbrev().toUpperCase()+" - "+player.getQualifiedPositions().join(", ")+"</span>";
			}
		},
		addPlayerToRow: function(player, pos) {
			var count = 1;
			if(pos === "of") {
				var ofRow = this.element.find("#of"+count + " td:eq(1)");
				while(ofRow.html() !== "") {
					count++;
					ofRow = this.element.find("#of"+count + " td:eq(1)");
				}
				ofRow.parent().removeClass("empty").attr("data-pid", player.getPlayerID()).end().html(this.getFormattedPlayerCell(player));
			} else if(pos === "bn") {
				var bnRow = this.element.find("#bn"+count + " td:eq(1)");
				while(bnRow.html() !== "") {
					count++;
					bnRow = this.element.find("#bn"+count + " td:eq(1)");
					if(bnRow.length === 0) {
						this.element.find("tbody.bench").append('<tr id="bn'+count+'"><td>BN</td><td></td></tr>');
				        bnRow = this.element.find("#bn"+count + " td:eq(1)");
					}
				}
				bnRow.parent().removeClass("empty").attr("data-pid", player.getPlayerID()).end().html(this.getFormattedPlayerCell(player));
			} else {
				this.element.find("#"+pos+" td:eq(1)").parent().removeClass("empty").attr("data-pid", player.getPlayerID()).end().html(this.getFormattedPlayerCell(player));
			}
		},
		handlePlayerSelected: function(evt, args) {
			this.element.find("table tbody tr").removeClass("selected");
		},
		handlePlayerDrafted: function(evt, args) {
			switch(this.currentFilter) {
				case "team":
					var selectedManagerID = $("#team-view select").val();
					this.renderTeamTableByOwnerID(selectedManagerID);
					break;
				case "round":
					var lastRound = controller.getDrafted().getLastRound();
					//add the current round option (if it isn't there)
					if($("#round-view select option[value="+lastRound+"]").length === 0) {
						$("#round-view select").append('<option value="'+lastRound+'">Round '+lastRound+'</option>');
					}
					//only re-render the table if the incoming round is being viewed
					if(+$("#round-view select").val() === lastRound) {
						this.renderRoundTable(lastRound, true);
					}
					break;
				case "tally":
					this.renderTallyTable();
					break;
			}
		},
		init: function(div, template) {
			this._super(div, template);

			var handlePlayerSelectedFunction = $.proxy(this.handlePlayerSelected, this);

			this.connect([{event:eventEnums.MANAGER_DATA_LOADED, handler:$.proxy(this.handleManagerDataLoaded, this)},
						  {event:eventEnums.DRAFTED_DATA_LOADED, handler:$.proxy(this.handleDraftedDataLoaded, this)},
						  {event:eventEnums.PLAYER_GRID_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_QUEUE_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)}]);

			this.addViewListeners();
		}
	}).prototype;
});