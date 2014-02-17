define("data/DataPathManager", function( require, exports, module ) {

	var _ids = {
			"templates": "tplLib.xml",
			"drafted": "/fantasylookup/json/named.wsfb_drafted.bam",
			"league": "/fantasylookup/json/named.wsfb_league.bam",
			"manager": "/fantasylookup/json/named.wsfb_manager.bam",
			"player_roster": "/fantasylookup/rawjson/named.wsfb_draft_roster_player_tpl.bam"
		},
		version = appVersion;

	exports.getDataPath = function(id) {
		var path;
		if(location.href.indexOf("localhost") !== -1) {
			if(location.pathname.indexOf("app-build/") !== -1) {
				if(id === "templates") {
					path = version+"/src/xml/"+_ids[id];
				} else {
					path = "proxy.php?url=http://qa.mlb.com"+_ids[id];
				}
			} else {
				if(id === "templates") {
					path = "/FantasyDraft2014/src/xml/"+_ids[id];
				} else {
					path = "proxy.php?url=http://qa.mlb.com"+_ids[id];
				}
			}
		} else {
			if(id === "templates") {
				path = "/mlb/components/fantasy/fb/draft/"+version+"/src/xml/"+_ids[id];
			} else {
				path = _ids[id];
			}
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
			path = "/mlb/components/fantasy/fb/draft/"+version+"/src/images/"+image;
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