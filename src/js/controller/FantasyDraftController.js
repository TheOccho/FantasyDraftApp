define("controller/FantasyDraftController", function( require, exports, module ) {
	var instance = null,
		_leagueID,
		_managerID,
		templatelib = require("model/TemplateLibrary"),
		league = require("model/League"),
		manager = require("model/Manager"),
		drafted = require("model/Drafted"),
		playerroster = require("model/PlayerRoster"),
		eventEnums = require("enums/EventEnums");
	 
	function FantasyDraftController() {
		if(instance !== null){
			throw new Error("Cannot instantiate more than one FantasyDraftController, use FantasyDraftController.getInstance()");
		}
	}

	FantasyDraftController.prototype = {
		dispatchEvent: function(eventEnum, eventArgs) {
			this.trigger(eventEnum, eventArgs);
		},
		loadTemplates: function() {
			templatelib.loadTemplates(instance);
		},
		loadLeague: function(leagueID) {
			_leagueID = leagueID;
			league.loadLeague(leagueID, instance);
		},
		loadManager: function(managerID) {
			_managerID = managerID;
			manager.loadManager(managerID, instance);
		},
		loadPlayerRoster: function() {
			playerroster.loadPlayerRoster(instance);
		},
		loadDrafted: function(leagueID) {
			drafted.loadDrafted(leagueID, instance);
		},
		getLeague: function() {
			return league;
		},
		getManager: function() {
			return manager;
		},
		getPlayerRoster: function() {
			return playerroster;
		},
		getDrafted: function() {
			return drafted;
		},
		getLeagueID: function() {
			return _leagueID;
		},
		getManagerID: function() {
			return _managerID;
		}
	};
	FantasyDraftController.getInstance = function() {
		// Gets an instance of the singleton. It is better to use
		if(instance === null){
			instance = new FantasyDraftController();
		}
		return instance;
	};
	
	$.bindable(FantasyDraftController.prototype);

	return FantasyDraftController.getInstance();
});