define("data/DataPathManager", function( require, exports, module ) {

	var _ids = {
			"templates": "tplLib.xml",
			"drafted": "drafted.xml",
			"league": "league.xml",
			"manager": "manager.xml",
			"player_roster": "player_roster_top100.xml"
		},
		version = requireBaseUrl.split("/")[0];

	exports.getDataPath = function(id) {
		var path;
		if(location.href.indexOf("localhost") !== -1) {
			if(location.pathname.indexOf("builds-temp/") !== -1) {
				path = version+"/src/xml/"+_ids[id];
			} else {
				path = "/FantasyDraft2014/src/xml/"+_ids[id];
			}
		} else {
			path = version+"/src/xml/"+_ids[id];
		}
		return path;
	};

	exports.getImagePath = function(image) {
		var path;
		if(location.href.indexOf("localhost") !== -1) {
			if(location.pathname.indexOf("builds-temp/") !== -1) {
				path = version+"/src/images/"+image;
			} else {
				path = "/FantasyDraft2014/src/images/"+image;
			}
		} else {
			path = version+"/src/images/"+image;
		}
		return path;
	};
});