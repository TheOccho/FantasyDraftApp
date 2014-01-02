define("view/playerGrid/PlayerGrid", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		dataPathManager = require("data/DataPathManager"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		_hitterColumnHeaders = [{label:"Rk",sort:["asc"]},
								{label:"Player Name",sort:['asc','desc']},
								{label:"Pts",sort:["desc"]},
								{label:"AB",sort:["desc"]},
								{label:"R",sort:["desc"]},
								{label:"HR",sort:["desc"]},
								{label:"RBI",sort:["desc"]},
								{label:"BB",sort:["desc"]},
								{label:"SB",sort:["desc"]},
								{label:"AVG",sort:["desc"]}],
		_pitcherColumnHeaders = [{label:"Rk",sort:["asc"]},
								{label:"Player Name",sort:['asc','desc']},
								{label:"Pts",sort:["desc"]},
								{label:"W",sort:["desc"]},
								{label:"IP",sort:["desc"]},
								{label:"H",sort:["desc"]},
								{label:"BB",sort:["desc"]},
								{label:"K",sort:["desc"]},
								{label:"SHO",sort:["desc"]},
								{label:"ERA",sort:["asc"]}],
		oTable,
		oSettings;

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
					return "b";
				case "p":
					return "p";
			}
		},
		renderPlayerGridByCurrentFilter: function() {
			switch(this.currentFilter) {
				case "all":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getAllHitters());
					break;
				case "c":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getCatchers());
					break;
				case "1b":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getFirstBasemen());
					break;
				case "2b":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getSecondBasemen());
					break;
				case "ss":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getShortstops());
					break;
				case "3b":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getThirdBasemen());
					break;
				case "of":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getOutfielders());
					break;
				case "p":
					this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getAllPitchers());
					break;
			}
		},
		addViewListeners: function() {
			var that = this;
			$(document).on("click", this.__targetDiv + " #position-filter li.tab", function(e) {
				var filterClicked = $(this);
				if(filterClicked.attr("data-id") === that.currentFilter) {
					return false;
				}
				that.currentFilter = filterClicked.attr("data-id");
				that.element.find("#position-filter li.tab").removeClass("selected");
				filterClicked.addClass("selected");

				if(that.currentFilter === "search") {
					that.currentFilter = "all";
					that.renderPlayerGrid(that.element.find("table tbody"), controller.getPlayerRoster().getAllHitters());
					that.currentFilter = "search";
					$("#search-filter").show();
					$("#ranking-stat-filters").hide();
				} else {
					$("#search-filter").hide();
					$("#ranking-stat-filters").show();
					that.renderPlayerGridByCurrentFilter();
				}
			});

			//ranking filter clicks and stats filter click
			$(document).on("click", this.__targetDiv + " #ranking-stat-filters span.filter", function(e) {
				var filterClickedID = $(this).attr("data-id");
				if((filterClickedID === "custom" || filterClickedID === "default") && that.currentRankFilter !== filterClickedID) {
					that.currentRankFilter = filterClickedID;
					$("#ranking-stat-filters #ranking span.filter").removeClass("selected");
					$("#ranking-stat-filters #ranking span.filter[data-id="+filterClickedID+"]").addClass("selected");
				} else if((filterClickedID === "proj" || filterClickedID === "last") && that.currentStatsFilter !== filterClickedID) {
					that.currentStatsFilter = filterClickedID;
					$("#ranking-stat-filters #stats span.filter").removeClass("selected");
					$("#ranking-stat-filters #stats span.filter[data-id="+filterClickedID+"]").addClass("selected");
					that.renderPlayerGridByCurrentFilter();
				}
			});

			//player row clicks
			$(document).on("click", this.__targetDiv + " table tbody tr", function(e) {
				var selectedPlayerRow = $(this);
				if(selectedPlayerRow.find("img").length > 0) {
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
				oTable.fnDraw();
			});

			//search for player listener
			$(document).on("keyup", this.__targetDiv + " #search-filter input", function(e) {
				oTable.fnFilter( this.value, 1 );
			});			
		},
	    renderPlayerGrid: function(table, players) {
	    	var that = this;
	    	if(typeof oTable !== "undefined") {
	    		var table = $('#player-grid-table').dataTable();
				table.fnClearTable();
	    	}	
	    	var rows = [];
			for(var i=0,l=players.length;i<l;i++) {
				var player = [];
				if(players[i].getPrimaryPosition() === "P") {
					player.push(players[i].getRank());
					player.push(players[i].getFirstName() + " " + players[i].getLastName() + '</br><span class="player-team-pos">' + players[i].getTeamAbbrev().toUpperCase() + ' - P</span>');
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getPoints());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getWins());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getInningsPitched());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getHits());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getWalks());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getStrikeouts());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getShutouts());
					player.push("a");
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getERA());
					player.push(players[i].getPlayerID());
					player.push(players[i].getIsDrafted());
					rows.push(player);
				} else {
					player.push(players[i].getRank());
					player.push(players[i].getFirstName().charAt(0) + ". " + players[i].getLastName() + '</br><span class="player-team-pos">' + players[i].getTeamAbbrev().toUpperCase() + " - " + players[i].getQualifiedPositions().join(", ") + '</span>');
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getPoints());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getAtBats());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getRuns());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getHomeruns());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getRBI());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getBB());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getStolenBases());
					player.push(players[i][(that.currentStatsFilter === "proj") ? "getProjectedStats" : "getLastYearStats"]().getAVG());
					player.push("b");
					player.push(players[i].getPlayerID());
					player.push(players[i].getIsDrafted());
					rows.push(player);
				}
				if(typeof oTable !== "undefined") {
					table.oApi._fnAddData(oSettings, player);
				}
			}
			if(typeof oTable === "undefined") {
				//set filtering for showing/hiding drafted players
				$.fn.dataTableExt.afnFiltering.push(
					function( oSettings, aData, iDataIndex ) {
						var nTr = oSettings.aoData[iDataIndex].nTr;
						if(nTr === null) {
							return true;
						}
						if(nTr.className.match("drafted") && $($(".hide-drafted input")[0]).prop("checked")) {
							return false;
						} else {
							return true;
						}
					}
				);
				oTable = $('#player-grid-table').dataTable( {
					"sScrollY": "411px",
					"aaData": rows,
					"oLanguage": {
						"sZeroRecords": '<img src="'+dataPathManager.getImagePath("no-results.png")+'">'
			        },
					"aoColumns": [
						{ "sTitle": "Rk", "asSorting": [ "asc" ] },
						{ "sTitle": "Player Name", "sClass": "player-name", "asSorting": ['asc','desc'] },
						{ "sTitle": "Pts", "asSorting": [ "desc" ] },
						{ "sTitle": "AB", "asSorting": [ "desc" ] },
						{ "sTitle": "R", "asSorting": [ "desc" ] },
						{ "sTitle": "HR", "asSorting": [ "desc" ] },
						{ "sTitle": "RBI", "asSorting": [ "desc" ] },
						{ "sTitle": "BB", "asSorting": [ "desc" ] },
						{ "sTitle": "SB", "asSorting": [ "desc" ] },
						{ "sTitle": "AVG", "asSorting": [ "desc" ] },
						{ "sTitle": "ERA", "asSorting": [ "asc" ], "bVisible": false }
					],
					"fnCreatedRow": function( nRow, aData, iDataIndex ) {
						$(nRow).attr("data-pid", aData[11]);
						$("td:eq(1)", nRow).addClass("player-name");
						if(aData[12]) {
							$(nRow).addClass("drafted");
						}
					},
					"fnDrawCallback": function( oSettings ) {
						$("th.player-name").width(160);
					},
					"sDom": "ftS",
					"bDeferRender": true
				} );
				oSettings = oTable.fnSettings();
			} else {
				var b_or_p = this.getBatterOrPitcher();
				var columnHeaders = (b_or_p === "b") ? _hitterColumnHeaders : _pitcherColumnHeaders;
				for(var i=0,l=columnHeaders.length;i<l;i++) {
					$(oSettings.aoColumns[i].nTh).html(columnHeaders[i].label);
				}
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				table.fnDraw();
				if(b_or_p === "b") {
					table.fnSetColumnVis(9, true);
					table.fnSetColumnVis(10, false);
				} else {
					table.fnSetColumnVis(9, false);
					table.fnSetColumnVis(10, true);
				}
				//force table to sort by first column ("rank")
				table.fnSort( [ [0, 'asc'] ] );
			}
		},
		handleDraftedDataLoaded: function(evt, args) {
			this.renderPlayerGrid(this.element.find("table tbody"), controller.getPlayerRoster().getAllHitters());
		},
		handlePlayerSelected: function(evt, args) {
			this.element.find("table tbody tr").removeClass("selected");
		},
		init: function(div, template) {
			this._super(div, template);

			var handlePlayerSelectedFunction = $.proxy(this.handlePlayerSelected, this);

			this.connect([{event:eventEnums.DRAFTED_DATA_LOADED, handler:$.proxy(this.handleDraftedDataLoaded, this)},
						  {event:eventEnums.PLAYER_QUEUE_PLAYER_SELECTED, handler:handlePlayerSelectedFunction},
						  {event:eventEnums.DRAFT_RESULTS_PLAYER_SELECTED, handler:handlePlayerSelectedFunction}]);

			this.addViewListeners();

			//uncheck hide drafted
			$(".hide-drafted input").prop("checked", false);
		}
	});
});