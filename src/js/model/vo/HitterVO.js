define("model/vo/HitterVO", function( require, exports, module ) {

	/*{
	    "q_pos": "OF/U",
	    "rank": "1",
	    "has_injury": "y",
	    "team_abbrev": "LAA",
	    "last": "Trout",
	    "stats": [
	        {
	            "s_type": "three_year_average",
	            "pts": "500"
	        },
	        {
	            "b_ab": "600",
	            "r_sb": "36",
	            "b_bb": "96",
	            "b_doubles": "35",
	            "b_avg": ".318",
	            "b_h": "191",
	            "s_type": "season_projected",
	            "b_rbi": "88",
	            "r_r": "112",
	            "b_hr": "29",
	            "pts": "687"
	        },
	        {
	            "b_ab": "589",
	            "r_sb": "33",
	            "b_bb": "110",
	            "b_doubles": "39",
	            "b_avg": ".323",
	            "b_h": "190",
	            "s_type": "last_year",
	            "b_rbi": "97",
	            "r_r": "109",
	            "b_hr": "27",
	            "pts": "703"
	        }
	    ],
	    "age": "22",
	    "has_news": "n",
	    "player_id": "545361",
	    "team_id": "108",
	    "first": "Mike",
	    "team_full": "Los Angeles Angels",
	    "pos": "OF"
	}*/

    var statsvo = require("model/vo/HitterStatsVO"); 

	function HitterVO() {
		this._type = "hitter";
		this._data;
		this._isDrafted = false;
	}

	HitterVO.prototype = {
		setData: function(data) {
			this._data = data;

			//create stats vo's
			var tmpStatsHash = {three_year_average:undefined, season_projected:undefined, last_year: undefined};
			for(var i=0,l=data.stats.length;i<l;i++) {
				var tmpStatsVO = new statsvo();
				tmpStatsVO.setData(data.stats[i]);
				tmpStatsHash[data.stats[i].s_type] = tmpStatsVO;
			}
			this._data.stats = tmpStatsHash;
		},
		getType: function() {
			return this._type;
		},
		getPlayerID: function() {
			return this._data.player_id || "";
		},
		getFirstName: function() {
			return this._data.first || "";
		},
		getLastName: function() {
			return this._data.last || "";
		},
		getFullName: function() {
			return this._data.first + " " + this._data.last;
		},
		getAge: function() {
			return this._data.age || "";
		},
		getPrimaryPosition: function() {
			return this._data.pos || "";
		},
		getQualifiedPositions: function() {
			var arr = this._data.q_pos.split("/");
			//remove the U (but not if it's the only qualified pos)
			if(arr.length > 1) arr.pop();
			return (arr.length > 0) ? arr : "";
		},
		getTeamID: function() {
			return this._data.team_id || "";
		},
		getTeamAbbrev: function() {
			return this._data.team_abbrev || "";
		},
		getTeamFullName: function() {
			return this._data.team_full || "";
		},
		getRank: function() {
			return this._data.rank || "";
		},
		getCustomRank: function() {
			return this._data.custom_rank || "";
		},
		getHasInjury: function() {
			return (typeof this._data.has_injury !== "undefined") ? this._data.has_injury : "n";
		},
		getHasNews: function() {
			return (typeof this._data.has_news !== "undefined") ? this._data.has_news : "n";
		},
		getLastYearStats: function() {
			return this._data.stats.last_year;
		},
		getProjectedStats: function() {
			return this._data.stats.season_projected;
		},
		getThreeYearAvgStats: function() {
			return this._data.stats.three_year_average;
		},
		getIsDrafted: function() {
			return this._isDrafted;
		},
		setIsDrafted: function(bool) {
			this._isDrafted = bool;
		},
		getStatsByTypeName: function(type) {
			switch(type) {
				case "last":
					return this.getLastYearStats();
				case "proj":
					return this.getProjectedStats();
				case "avg":
					return this.getThreeYearAvgStats();
			}
		}
	}

	return HitterVO;
});