define("main", function( require, exports, module ) {

	var _leagueID,
		_managerID,
		templateEnums = require("enums/TemplateEnums"),
		eventEnums = require("enums/EventEnums"),
		controller = require("controller/FantasyDraftController"),
		bot = require("bot/FantasyDraftBot");

	//view modules
	var dialogBox = require("view/dialogBox/DialogBox"),
		headerStrip = require("view/header/HeaderStrip"),
		pickCarousel = require("view/pickCarousel/PickCarousel"),
		selectedPlayer = require("view/selectedPlayer/SelectedPlayer"),
		playerQueue = require("view/playerQueue/PlayerQueue"),
		playerGrid = require("view/playerGrid/PlayerGrid"),
		draftResults = require("view/draftResults/DraftResults"),
		chat = require("view/chat/Chat");

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
			dialogBox.init("#dialog-box", templateEnums.DIALOG_BOX);
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
			controller.loadManager(_managerID);
		});
		controller.bind(eventEnums.MANAGER_DATA_LOADED, function(e) {
			controller.loadPlayerRoster();
		});
		controller.bind(eventEnums.PLAYER_ROSTER_DATA_LOADED, function(e) {
			controller.loadDrafted(_leagueID);
		});
		controller.bind(eventEnums.DRAFTED_DATA_LOADED, function(e) {
			
			//init bot
			bot.init(_leagueID, _managerID);
		});
		controller.loadTemplates();
	}
});