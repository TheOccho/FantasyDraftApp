define("view/playerGrid/PlayerGrid", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		dataPathManager = require("data/DataPathManager"),
		templateLib = require("model/TemplateLibrary"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		_hitterColumnHeaders = ["Rk","Rk","Player Name","","Pts","Pts","AB","AB","R","R","HR","HR","RBI","RBI","BB","BB","SB","SB","AVG","AVG"],
		_pitcherColumnHeaders = ["Rk","Rk","Player Name","","Pts","Pts","W","W","IP","IP","H","H","BB","BB","K","K","SHO","SHO","ERA","ERA"],
		_searchInterval,
		_hideDraftedChecked = false,
		oTable;

	return AbstractFantasyDraftView.extend({
		label: "player grid",
		currentFilter: "all",
		currentStatsFilter: "proj",
		currentRankFilter: "default",
		getBatterOrPitcher: function() {
			switch(this.currentFilter) {
				case "all":
				case "c":
				case "1b":
				case "2b":
				case "ss":
				case "3b":
				case "of":
				case "search":
					return "b";
				case "p":
					return "p";
			}
		},
		getFilterRegEx: function() {
			switch(this.currentFilter) {
				case "all":
				case "search":
					return "c|1b|2b|ss|3b|of|u";
				default:
					return this.currentFilter;
			}
		},
		adjustColumnHeaders: function() {
			var b_or_p = this.getBatterOrPitcher();
			var columnHeaders = (b_or_p === "b") ? _hitterColumnHeaders : _pitcherColumnHeaders;
			for(var i=0,l=columnHeaders.length;i<l;i++) {
				$(oTable.fnSettings().aoColumns[i].nTh).html(columnHeaders[i]);
			}
		},
		showHideColumns: function() {
			//check rankings type
			if(this.currentRankFilter === "default") {
				oTable.fnSetColumnVis(0, true, false);
				oTable.fnSetColumnVis(1, false, false);
			} else if(this.currentRankFilter === "custom") {
				oTable.fnSetColumnVis(0, false, false);
				oTable.fnSetColumnVis(1, true, false);
			}
			//check stats type
			if(this.currentStatsFilter === "proj") {
				oTable.fnSetColumnVis(4, true, false);
				oTable.fnSetColumnVis(5, false, false);
				oTable.fnSetColumnVis(6, true, false);
				oTable.fnSetColumnVis(7, false, false);
				oTable.fnSetColumnVis(8, true, false);
				oTable.fnSetColumnVis(9, false, false);
				oTable.fnSetColumnVis(10, true, false);
				oTable.fnSetColumnVis(11, false, false);
				oTable.fnSetColumnVis(12, true, false);
				oTable.fnSetColumnVis(13, false, false);
				oTable.fnSetColumnVis(14, true, false);
				oTable.fnSetColumnVis(15, false, false);
				oTable.fnSetColumnVis(16, true, false);
				oTable.fnSetColumnVis(17, false, false);
			} else if(this.currentStatsFilter === "last") {
				oTable.fnSetColumnVis(4, false, false);
				oTable.fnSetColumnVis(5, true, false);
				oTable.fnSetColumnVis(6, false, false);
				oTable.fnSetColumnVis(7, true, false);
				oTable.fnSetColumnVis(8, false, false);
				oTable.fnSetColumnVis(9, true, false);
				oTable.fnSetColumnVis(10, false, false);
				oTable.fnSetColumnVis(11, true, false);
				oTable.fnSetColumnVis(12, false, false);
				oTable.fnSetColumnVis(13, true, false);
				oTable.fnSetColumnVis(14, false, false);
				oTable.fnSetColumnVis(15, true, false);
				oTable.fnSetColumnVis(16, false, false);
				oTable.fnSetColumnVis(17, true, false);
			}
			if(this.getBatterOrPitcher() === "b") {
				if(this.currentStatsFilter === "proj") {
					oTable.fnSetColumnVis(18, true, false);
					oTable.fnSetColumnVis(19, false, false);
				} else if(this.currentStatsFilter === "last") {
					oTable.fnSetColumnVis(18, false, false);
					oTable.fnSetColumnVis(19, true, false);
				}
				oTable.fnSetColumnVis(20, false, false);
				oTable.fnSetColumnVis(21, false, false);
			} else {
				oTable.fnSetColumnVis(18, false, false);
				oTable.fnSetColumnVis(19, false, false);
				if(this.currentStatsFilter === "proj") {
					oTable.fnSetColumnVis(20, true, false);
					oTable.fnSetColumnVis(21, false, false);
				} else if(this.currentStatsFilter === "last") {
					oTable.fnSetColumnVis(20, false, false);
					oTable.fnSetColumnVis(21, true, false);
				}
			}
			$("#player-grid-table_wrapper th:not(.player-name)").width(30);
		},
		addViewListeners: function() {
			var that = this;
			$(document).on("click", this.__targetDiv + " #position-filter li.tab", function(e) {
				var sortByRank = false;
				var filterClicked = $(this);
				if(filterClicked.attr("data-id") === that.currentFilter) {
					return false;
				}

				//check if we're coming from or going to a P tab
				if(that.currentFilter === "p" || filterClicked.attr("data-id") === "p") {
					sortByRank = true;
					that.currentFilter = filterClicked.attr("data-id");
					that.showHideColumns();
					//adjust column headers
					that.adjustColumnHeaders();
				}
				that.currentFilter = filterClicked.attr("data-id");
				that.element.find("#position-filter li.tab").removeClass("selected");
				filterClicked.addClass("selected");

				if(that.currentFilter === "search") {
					$("#search-filter").show();
					$("#ranking-stat-filters").hide();
				} else {
					if($("#search-filter input").val() !== "") {
						$("#search-filter input").val("");
						//clear out any search queries that may have been lingering
						oTable.fnFilter( "", 2 );
					}
					$("#search-filter").hide();
					$("#ranking-stat-filters").show();
				}
				if(sortByRank) {
					//force table to sort by first column ("rank")
					oTable.fnSort( [ [0, 'asc'] ] );
				}
				oTable.fnFilter( that.getFilterRegEx(), 24, true );
			});

			//ranking filter clicks and stats filter click
			$(document).on("click", this.__targetDiv + " #ranking-stat-filters span.filter", function(e) {
				var filterClickedID = $(this).attr("data-id");
				if((filterClickedID === "custom" || filterClickedID === "default") && that.currentRankFilter !== filterClickedID) {
					that.currentRankFilter = filterClickedID;
					$("#ranking-stat-filters #ranking span.filter").removeClass("selected");
					$("#ranking-stat-filters #ranking span.filter[data-id="+filterClickedID+"]").addClass("selected");
					that.showHideColumns();
					oTable.fnSort( [ [(that.currentRankFilter === "default") ? 0 : 1, 'asc'] ] );
				} else if((filterClickedID === "proj" || filterClickedID === "last") && that.currentStatsFilter !== filterClickedID) {
					that.currentStatsFilter = filterClickedID;
					$("#ranking-stat-filters #stats span.filter").removeClass("selected");
					$("#ranking-stat-filters #stats span.filter[data-id="+filterClickedID+"]").addClass("selected");
					that.showHideColumns();
					//sort on whatever column was being sorted on
					var previousSort = oTable.fnSettings().aaSorting;
					if(previousSort[0][0] > 2) {
						if(that.currentStatsFilter === "proj") {
							previousSort[0][0]--;
						} else if(that.currentStatsFilter === "last") {
							previousSort[0][0]++;
						}
						oTable.fnSort( previousSort );
					}
				}
			});
			
			//player row clicks
			$(document).on("click", this.__targetDiv + " tr td img.icon", function(e) {
				var selectedPlayerRow = $(this).parent().parent();
				controller.dispatchEvent(eventEnums.SHOW_PLAYER_CARD_DIALOG_NOTES, [ {playerID: selectedPlayerRow.attr("data-pid") } ]);
			});

			$(document).on("click", this.__targetDiv + " table tbody tr", function(e) {
				var selectedPlayerRow = $(this);
				var imageInRow = selectedPlayerRow.find("img");
				if(!imageInRow.hasClass("icon")) {
					return false;
				}

				if(selectedPlayerRow.hasClass("selected")) {
					selectedPlayerRow.removeClass("selected");
				} else {
					that.element.find("table tbody tr").removeClass("selected");
					selectedPlayerRow.addClass("selected");
				}
				controller.dispatchEvent(eventEnums.PLAYER_GRID_PLAYER_SELECTED, [ {playerID: selectedPlayerRow.attr("data-pid") } ]);
			});

			//hide/show drafted
			$(document).on("change", this.__targetDiv + " .hide-drafted input", function(e) {
				//force filter of drafted players
				$(".hide-drafted input").prop("checked", $(this).prop("checked"));
				_hideDraftedChecked = $(this).prop("checked");
				var scrollPos = $(".dataTables_scrollBody").scrollTop();
				oTable.fnFilter( that.getFilterRegEx(), 24, true );
				$(".dataTables_scrollBody").scrollTop(scrollPos);
			});

			//search for player listener
			$(document).on("keyup", this.__targetDiv + " #search-filter input", function(e) {
				var that = this;
				clearInterval(_searchInterval);
				_searchInterval = setTimeout(function() {
					oTable.fnFilter( that.value, 2 );
				}, 500);
			});			
		},
		handleTableCellSort: function(data, type, full) {
			if(type === "display") {
				return data;
			}
			if(type === "filter" || type === "sort") {
				var elem = $(data);
				if(elem.length === 0) {
					return "";
				} else {
					return (this.currentStatsFilter === "proj") ? elem[0].innerHTML : elem[1].innerHTML;
				}
			}
		},
	    renderPlayerGrid: function(table, players) {
	    	var that = this;
	    	var handleTableCellSortProxied = $.proxy(this.handleTableCellSort, this);
	    	var rows = [];
			for(var i=0,l=players.length;i<l;i++) {
				var player = [];
				if(players[i].getType() === "pitcher") {
					player.push(players[i].getRank());
					player.push(players[i].getCustomRank());
					player.push($.template(templateLib.getTemplateByID(templateEnums.PLAYER_GRID_PLAYER_CELL), {injuryIconPath: dataPathManager.getImagePath("injury-report-icon.png"), newsIconPath: dataPathManager.getImagePath("news-icon.png"), playerData: players[i]}, true));
					player.push(players[i].getFirstName());
					player.push(players[i].getProjectedStats().getPoints());
					player.push(players[i].getLastYearStats().getPoints());
					player.push(players[i].getProjectedStats().getWins());
					player.push(players[i].getLastYearStats().getWins());
					player.push(players[i].getProjectedStats().getInningsPitched());
					player.push(players[i].getLastYearStats().getInningsPitched());
					player.push(players[i].getProjectedStats().getHits());
					player.push(players[i].getLastYearStats().getHits());
					player.push(players[i].getProjectedStats().getWalks());
					player.push(players[i].getLastYearStats().getWalks());
					player.push(players[i].getProjectedStats().getStrikeouts());
					player.push(players[i].getLastYearStats().getStrikeouts());
					player.push(players[i].getProjectedStats().getShutouts());
					player.push(players[i].getLastYearStats().getShutouts());
					player.push("p1");
					player.push("p2");
					player.push(players[i].getProjectedStats().getERA());
					player.push(players[i].getLastYearStats().getERA());
					player.push(players[i].getPlayerID());
					player.push(players[i].getIsDrafted());
					player.push(players[i].getQualifiedPositions());
					rows.push(player);
				} else {
					player.push(players[i].getRank());
					player.push(players[i].getCustomRank());
					player.push($.template(templateLib.getTemplateByID(templateEnums.PLAYER_GRID_PLAYER_CELL), {injuryIconPath: dataPathManager.getImagePath("injury-report-icon.png"), newsIconPath: dataPathManager.getImagePath("news-icon.png"), playerData: players[i]}, true));
					player.push(players[i].getLastName());
					player.push(players[i].getProjectedStats().getPoints());
					player.push(players[i].getLastYearStats().getPoints());
					player.push(players[i].getProjectedStats().getAtBats());
					player.push(players[i].getLastYearStats().getAtBats());
					player.push(players[i].getProjectedStats().getRuns());
					player.push(players[i].getLastYearStats().getRuns());
					player.push(players[i].getProjectedStats().getHomeruns());
					player.push(players[i].getLastYearStats().getHomeruns());
					player.push(players[i].getProjectedStats().getRBI());
					player.push(players[i].getLastYearStats().getRBI());
					player.push(players[i].getProjectedStats().getBB());
					player.push(players[i].getLastYearStats().getBB());
					player.push(players[i].getProjectedStats().getStolenBases());
					player.push(players[i].getLastYearStats().getStolenBases());
					player.push(players[i].getProjectedStats().getAVG());
					player.push(players[i].getLastYearStats().getAVG());
					player.push("b1");
					player.push("b2");
					player.push(players[i].getPlayerID());
					player.push(players[i].getIsDrafted());
					player.push(players[i].getQualifiedPositions());
					rows.push(player);
				}
			}
			oTable = $('#player-grid-table').dataTable( {
				"sScrollY": "411px",
				"aaData": rows,
				"oLanguage": {
					"sZeroRecords": '<img src="'+dataPathManager.getImagePath("no-results.png")+'">'
		        },
				"aoColumns": [
					{ "sTitle": "Rk", "asSorting": [ "asc" ], "sType": "numeric" },
					{ "sTitle": "Rk", "asSorting": [ "asc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "Player Name", "sClass": "player-name", "asSorting": ['asc','desc'], "sType": "string", "iDataSort": 3 },
					{ "bVisible": false},
					{ "sTitle": "Pts", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "Pts", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "AB", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "AB", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "R", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "R", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "HR", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "HR", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "RBI", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "RBI", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "BB", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "BB", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "SB", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "SB", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "AVG", "asSorting": [ "desc" ], "sType": "numeric" },
					{ "sTitle": "AVG", "asSorting": [ "desc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "ERA", "asSorting": [ "asc" ], "sType": "numeric", "bVisible": false },
					{ "sTitle": "ERA", "asSorting": [ "asc" ], "sType": "numeric", "bVisible": false },
					{ "bVisible": false },
					{ "bVisible": false },
					{ "bVisible": false }
				],
				"fnRowCallback": function(nRow, aData) {
					nRow = $(nRow);
					if(!nRow.attr("data-pid")) {
						nRow.attr("data-pid", aData[22]);
						nRow.find("td:eq(1)").addClass("player-name");
					}
					if(aData[23]) {
						nRow.removeClass("selected").addClass("drafted");
					}
				},
				"fnDrawCallback": function( oSettings ) {
					$("#player-grid-table_wrapper th.player-name").width(160);
					$("#player-grid-table_wrapper th:not(.player-name)").width(30);
				},
				"sDom": "tSr",
				"bDeferRender": true
			} );
			//set custom filtering for showing/hiding drafted players
			$.fn.dataTableExt.afnFiltering.push(
				function( oSettings, aData, iDataIndex ) {
					if(that.currentFilter === "all" || that.currentFilter === "search") {
						if(oSettings.aoData[iDataIndex]._aData[24].indexOf("P") === -1) {
							if(_hideDraftedChecked && oSettings.aoData[iDataIndex]._aData[23]) {
								return false;
							} else {
								return true;
							}
						} else {
							return false;
						}
					} else {
						if(oSettings.aoData[iDataIndex]._aData[24].indexOf(that.currentFilter.toUpperCase()) !== -1) {
							if(_hideDraftedChecked && oSettings.aoData[iDataIndex]._aData[23]) {
								return false;
							} else {
								return true;
							}
						} else {
							return false;
						}
					}
				}
			);
			//filter out pitchers since we know we default to the "all hitters" tab
			oTable.fnFilter( this.getFilterRegEx(), 24, true );
		},
		handleDraftedDataLoaded: function(evt, args) {
			this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getAllPlayers());
		},
		handlePlayerSelected: function(evt, args) {
			this.element.find("table tbody tr").removeClass("selected");
		},
		handlePlayerDrafted: function(evt, args) {
			var playerDraftedID = args.getPlayerID();
			//mark player as drafted in table via updating internal aoData
			oTable.fnUpdate(true, controller.getPlayerRoster().getPlayerIndexByPID(playerDraftedID), 23, false);
			//scroll back to where the user was
			var scrollPos = $(".dataTables_scrollBody").scrollTop();
			//filter to hide recently drafted player
			oTable.fnFilter( this.getFilterRegEx(), 24, true);
			$(".dataTables_scrollBody").scrollTop(scrollPos);
		},
		init: function(div, template) {
			this._super(div, template);

			var handlePlayerSelectedFunction = $.proxy(this.handlePlayerSelected, this);

			this.connect([{event:eventEnums.DRAFTED_DATA_LOADED, handler:$.proxy(this.handleDraftedDataLoaded, this)},
						  {event:eventEnums.PLAYER_QUEUE_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.DRAFT_RESULTS_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)}]);

			this.addViewListeners();

			//uncheck hide drafted
			$(".hide-drafted input").prop("checked", false);
		}
	}).prototype;
});