define("data/DataPathManager", function( require, exports, module ) {

	var _ids = {
			"templates": "tplLib.xml",
			"drafted": "drafted.xml",
			"league": "league.xml",
			"manager": "manager.xml",
			"player_roster": "player_roster_top100.xml"
		};

	exports.getDataPath = function(id) {
		var path;
		if(location.href.indexOf("localhost") !== -1) {
			if(location.pathname.indexOf("bin/release/") !== -1) {
				path = "/FantasyDraft2014/bin/release/src/xml/"+_ids[id];
			} else {
				path = "/FantasyDraft2014/src/xml/"+_ids[id];
			}
		} else {
			path = "/mlb/components/fantasy/fb/draft/src/xml/"+_ids[id];
		}
		return path;
	};
});