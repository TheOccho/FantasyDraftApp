define("main", function( require, exports, module ) {

	var _leagueID,
		_managerID,
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		controller = require("controller/FantasyDraftController"),
		bot = require("controller/FantasyDraftBot");

	//view modules
	var headerStrip = require("view/header/HeaderStrip").prototype;
	var pickCarousel = require("view/pickCarousel/PickCarousel").prototype;
	var selectedPlayer = require("view/selectedPlayer/SelectedPlayer").prototype;
	var playerQueue = require("view/playerQueue/PlayerQueue").prototype;
	var playerGrid = require("view/playerGrid/PlayerGrid").prototype;
	var draftResults = require("view/draftResults/DraftResults").prototype;
	var chat = require("view/chat/Chat").prototype;

	exports.init = function(leagueID, managerID) {
		//set manager/league specific vars
		_leagueID = leagueID;
		_managerID = managerID;

		//set leagueID/managerID on the controller
		controller.setLeagueID(_leagueID);
		controller.setManagerID(_managerID);

		//load data sequentially
		controller.bind(eventEnums.TEMPLATE_DATA_LOADED, function(e) {

			//init the view modules by passing them their respective element IDs
			headerStrip.init("#header-strip", templateEnums.HEADER_STRIP);
			pickCarousel.init("#pick-carousel", templateEnums.PICK_CAROUSEL);
			selectedPlayer.init("#selected-player", templateEnums.SELECTED_PLAYER);
			playerQueue.init("#player-queue", templateEnums.PLAYER_QUEUE);
			playerGrid.init("#player-grid", templateEnums.PLAYER_GRID);
			draftResults.init("#draft-results", templateEnums.DRAFT_RESULTS);
			chat.init("#chat", templateEnums.CHAT);

			controller.loadLeague(_leagueID);
		});
		controller.bind(eventEnums.LEAGUE_DATA_LOADED, function(e) {
			//init bot
			bot.init(_leagueID, _managerID, controller.getLeague().getChatServer(), controller.getLeague().getBotServer());

			controller.loadManager(_managerID);
		});
		controller.bind(eventEnums.MANAGER_DATA_LOADED, function(e) {
			controller.loadPlayerRoster();
		});
		controller.bind(eventEnums.PLAYER_ROSTER_DATA_LOADED, function(e) {
			controller.loadDrafted(_leagueID);
		});
		controller.loadTemplates();
	}
});