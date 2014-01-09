define("enums/EventEnums", function( require, exports, module ) {
	
	return {
		TEMPLATE_DATA_LOADED: "FantasyDraftEvent.TEMPLATE_DATA_LOADED",
		TEMPLATE_DATA_ERROR: "FantasyDraftEvent.TEMPLATE_DATA_ERROR",
		LEAGUE_DATA_LOADED: "FantasyDraftEvent.LEAGUE_DATA_LOADED",
		LEAGUE_DATA_ERROR: "FantasyDraftEvent.LEAGUE_DATA_LOADED",
		MANAGER_DATA_LOADED: "FantasyDraftEvent.MANAGER_DATA_LOADED",
		MANAGER_DATA_ERROR: "FantasyDraftEvent.MANAGER_DATA_LOADED",
		DRAFTED_DATA_LOADED: "FantasyDraftEvent.DRAFTED_DATA_LOADED",
		DRAFTED_DATA_ERROR: "FantasyDraftEvent.DRAFTED_DATA_ERROR",
		PLAYER_ROSTER_DATA_LOADED: "FantasyDraftEvent.PLAYER_ROSTER_DATA_LOADED",
		PLAYER_ROSTER_DATA_ERROR: "FantasyDraftEvent.PLAYER_ROSTER_DATA_ERROR",
		PLAYER_GRID_PLAYER_SELECTED: "FantasyDraftEvent.PLAYER_GRID_PLAYER_SELECTED",
		REQUEST_PLAYER_QUEUE: "FantasyDraftEvent.REQUEST_PLAYER_QUEUE",
		SEND_PLAYER_QUEUE: "FantasyDraftEvent.SEND_PLAYER_QUEUE",
		ADD_PLAYER_TO_QUEUE: "FantasyDraftEvent.ADD_PLAYER_TO_QUEUE",
		PLAYER_REMOVED_FROM_QUEUE: "FantasyDraftEvent.PLAYER_REMOVED_FROM_QUEUE",
		PLAYER_QUEUE_PLAYER_SELECTED: "FantasyDraftEvent.PLAYER_QUEUE_PLAYER_SELECTED",
		DRAFT_RESULTS_PLAYER_SELECTED: "FantasyDraftEvent.DRAFT_RESULTS_PLAYER_SELECTED",
		PLAYER_DRAFTED: "FantasyDraftEvent.PLAYER_DRAFTED"
	}
});