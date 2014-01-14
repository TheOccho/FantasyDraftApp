define("view/dialogBox/DialogBox", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		hitterstatsvo = require("model/vo/HitterStatsVO"),
		dataPathManager = require("data/DataPathManager"),
		templateLib = require("model/TemplateLibrary"),
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums");

	return AbstractFantasyDraftView.extend({
		label: "dialog box",
		addViewListeners: function() {
			var that = this;
			//handle close button click
			$(document).on("click", this.__targetDiv + " #close-btn, "+this.__targetDiv + " .backdrop", function(e) {
				//hide the overlay
				that.element.hide();
			});

			//handle player-card notes tab clicks
			$(document).on("click", this.__targetDiv + " div.playercard-wrapper li.tab", function(e) {
				if($(this).hasClass("selected")) {
					return false;
				}
				var tabClicked = $(this).attr("data-id");
				that.element.find("div.playercard-wrapper li.tab").removeClass("selected");
				$(this).addClass("selected");

				//hide/show copy
				that.element.find("div.playercard-wrapper .notes").hide();
				that.element.find("div.playercard-wrapper #"+tabClicked+"-notes").show();
			});

			//handle post-draft league homepage click
			$(document).on("click", this.__targetDiv + " #league-homepage-btn", function(e) {
				//open league homepage in a new tab
				window.open("/mlb/fantasy/fb/home.jsp", "_blank");
			});
		},
		handleShowDraftOrderDialog: function(evt, args) {
			//add league name/managers to draft order
			var leagueName = controller.getLeague().getLeagueName().toUpperCase();
			var managers = controller.getLeague().getManagers();
			//clear out container first
			this.element.find("#container").html($.template(templateLib.getTemplateByID(templateEnums.DIALOG_BOX_DRAFT_ORDER), {leagueName: leagueName, managers: managers}, true));
			//show dialog
			this.element.show();
		},
		handleShowPlayercardDialog: function(evt, args) {
			//show dialog with spinner
			this.element.find("#spinner").show().end().find("#container").empty().end().show();

			var playerID = args.playerID,
				playerVO = controller.getPlayerRoster().getPlayerByID(playerID),
				fantasyNews = $.ajax({url:dataPathManager.getProxyPath("fantasylookup/json/named.wsfb_fantasy_news_byplayer.bam?playerid="+playerID), dataType:"json"}),
				previewBlurb = $.ajax({url:dataPathManager.getProxyPath("fantasylookup/json/named.preview_player_info.bam?player_id="+playerID+"&year=2013"), dataType:"json"}),
				twentyTwelveStats = $.ajax({url:dataPathManager.getProxyPath(encodeURIComponent("lookup/json/named.mlb_individual_hitting_season.bam?game_type='R'&season=2012&player_id="+playerID)), dataType:"json"});
			
			//load necessary lookups
			var that = this;
			$.when(fantasyNews, previewBlurb, twentyTwelveStats).done(function(news, preview, stats) {
				//hide spinner
				that.element.find("#spinner").hide();
				
				news = (+news[2].responseJSON.wsfb_fantasy_news_byplayer.queryResults.totalSize > 0) ? news[2].responseJSON.wsfb_fantasy_news_byplayer.queryResults.row : {};
			    preview = (+preview[2].responseJSON.preview_player_info.queryResults.totalSize > 0) ? preview[2].responseJSON.preview_player_info.queryResults.row : {};
				stats = (+stats[2].responseJSON.mlb_individual_hitting_season.queryResults.totalSize > 0) ? stats[2].responseJSON.mlb_individual_hitting_season.queryResults.row : {};

				var tmpHitterStatsVO = new hitterstatsvo();
				tmpHitterStatsVO.setData(stats);
				statsData = [tmpHitterStatsVO, playerVO.getLastYearStats(), playerVO.getProjectedStats()];

				that.element.find("#container").html($.template(templateLib.getTemplateByID(templateEnums.DIALOG_BOX_PLAYER_CARD), { injuryIconPath: dataPathManager.getImagePath("injury-report-icon.png"), newsIconPath: dataPathManager.getImagePath("news-icon.png"), playerData: playerVO, news: news, preview: preview, stats: statsData }, true));

				//show dialog
				that.element.show();
			}).fail(function(error) {
				//hide spinner
				that.element.find("#spinner").hide();
			});
		},
		handleShowPostDraftDialog: function(evt, args) {
			//render
			this.element.find("#container").html($.template(templateLib.getTemplateByID(templateEnums.DIALOG_BOX_POST_DRAFT), {postDraftBgPath: dataPathManager.getImagePath("dialog-post-draft-bg.png")}, true));
			//show dialog
			this.element.show();
		},
		init: function(div, template) {
			this._super(div, template);

			//pass image path of the close button and the spinner to the overlay (hacky)
			this.element.find("img#close-btn").attr("src", dataPathManager.getImagePath("dialog-close-btn.png"));
			this.element.find("img#spinner").attr("src", dataPathManager.getImagePath("spinner-white-50x50.gif"));

			this.connect([{event:eventEnums.SHOW_DRAFT_ORDER_DIALOG, handler:$.proxy(this.handleShowDraftOrderDialog, this)},
						  {event:eventEnums.SHOW_PLAYER_CARD_DIALOG, handler:$.proxy(this.handleShowPlayercardDialog, this)},
						  {event:eventEnums.SHOW_POST_DRAFT_DIALOG, handler:$.proxy(this.handleShowPostDraftDialog, this)}]);

			this.addViewListeners();
		}
	}).prototype;
});