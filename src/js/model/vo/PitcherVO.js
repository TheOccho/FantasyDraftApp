define("model/vo/PitcherVO", function( require, exports, module ) {

	/*{
	    "q_pos": "P",
	    "rank": "488",
	    "has_injury": "n",
	    "team_abbrev": "LAD",
	    "last": "Dodgers",
	    "stats": [
	        {
	            "s_type": "three_year_average",
	            "pts": "261"
	        },
	        {
	            "p_ip": "1458",
	            "p_k": "1300",
	            "p_w": "97",
	            "p_h": "1323",
	            "p_sho": "19",
	            "p_era": "3.25",
	            "p_bb": "461",
	            "s_type": "season_projected",
	            "pts": "1310"
	        },
	        {
	            "p_ip": "1450.1",
	            "p_k": "1292",
	            "p_w": "92",
	            "p_h": "1321",
	            "p_sho": "22",
	            "p_era": "3.25",
	            "p_bb": "460",
	            "s_type": "last_year",
	            "pts": "276"
	        }
	    ],
	    "age": "",
	    "has_news": "n",
	    "player_id": "119",
	    "team_id": "119",
	    "first": "Los Angeles",
	    "team_full": "Los Angeles Dodgers",
	    "pos": "PS"
	}*/

    var statsvo = require("model/vo/PitcherStatsVO"); 

	function PitcherVO() {
		this._type = "pitcher";
		this._data;
		this._isDrafted = false;
	}

	PitcherVO.prototype = {
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
			return "P";
		},
		getQualifiedPositions: function() {
			return (this._data.q_pos) ? [ this._data.q_pos ] : [];
		},
		getTeamID: function() {
			return this._data.team_id || "";
		},
		getTeamAbbrev: function() {
			if(this._data.team_abbrev.toLowerCase() === "lad") {
				return "la";
			} else if(this._data.team_abbrev.toLowerCase() === "laa") {
				return "ana";
			}
			return this._data.team_abbrev.toLowerCase() || "";
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

	return PitcherVO;
});