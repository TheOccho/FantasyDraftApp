define("model/vo/HitterStatsVO", function( require, exports, module ) {

	/*
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
		}
	*/

	function HitterStatsVO() {
		this._data;
	}

	HitterStatsVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getStatType: function() {
			return this._data.s_type || "";
		},
		getPoints: function() {
			return this._data.pts || "--";
		},
		getAtBats: function() {
			return this._data.b_ab || "--";
		},
		getDoubles: function() {
			return this._data.b_doubles || "--";
		},
		getHomeruns: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.hr !== "undefined") {
				return this._data.hr;
			}
			return this._data.b_hr || "--";
		},
		getHits: function() {
			return this._data.b_h || "--";
		},
		getRBI: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.rbi !== "undefined") {
				return this._data.rbi;
			}
			return this._data.b_rbi || "--";
		},
		getBB: function() {
			return this._data.b_bb || "--";
		},
		getAVG: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.avg !== "undefined") {
				return this._data.avg;
			}
			return this._data.b_avg || "--";
		},
		getRuns: function() {
			return this._data.r_r || "--";
		},
		getStolenBases: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.sb !== "undefined") {
				return this._data.sb;
			}
			return this._data.r_sb || "--";
		},
		getStatByPropName: function(prop) {
			switch(prop) {
				case "s_type":
					return this.getStatType();
				case "pts":
					return this.getPoints();
				case "ab":
					return this.getAtBats();
				case "doubles":
					return this.getDoubles();
				case "hr":
					return this.getHomeruns();
				case "h":
					return this.getHits();
				case "rbi":
					return this.getRBI();
				case "bb":
					return this.getBB();
				case "avg":
					return this.getAVG();
				case "r":
					return this.getRuns();
				case "sb":
					return this.getStolenBases();
			}
		}
	};

	return HitterStatsVO;
});