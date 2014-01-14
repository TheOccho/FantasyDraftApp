define("data/DataPathManager", function( require, exports, module ) {

	var _ids = {
			"templates": "tplLib.xml",
			"drafted": "drafted.xml",
			"league": "league.xml",
			"manager": "manager.xml",
			"player_roster": "player_roster.xml"
		},
		version = requireBaseUrl.split("/")[0];

	exports.getDataPath = function(id) {
		var path;
		if(location.href.indexOf("localhost") !== -1) {
			if(location.pathname.indexOf("app-build/") !== -1) {
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
			if(location.pathname.indexOf("app-build/") !== -1) {
				path = version+"/src/images/"+image;
			} else {
				path = "/FantasyDraft2014/src/images/"+image;
			}
		} else {
			path = version+"/src/images/"+image;
		}
		return path;
	};

	exports.getProxyPath = function(path) {
		var path;
		if(location.href.indexOf("localhost") !== -1) {
			if(location.pathname.indexOf("app-build/") !== -1) {
				path = "../proxy.php?url=http://mlb.mlb.com"+path;
			} else {
				path = "proxy.php?url=http://mlb.mlb.com"+path;
			}
		} else {
			path = decodeURIComponent(path);
		}
		return path;
	};
});