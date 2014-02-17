define("model/vo/PitcherStatsVO", function( require, exports, module ) {

	/*
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
		}
	*/

	function PitcherStatsVO() {
		this._data;
	}

	PitcherStatsVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getStatType: function() {
			return this._data.s_type || "--";
		},
		getPoints: function() {
			return this._data.pts || "--";
		},
		getWins: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.w !== "undefined") {
				return this._data.w;
			}
			return this._data.p_w || "--";
		},
		getStrikeouts: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.so !== "undefined") {
				return this._data.so;
			}
			return this._data.p_k || "--";
		},
		getShutouts: function() {
			return this._data.p_sho || "--";
		},
		getHits: function() {
			return this._data.p_h || "--";
		},
		getWalks: function() {
			return this._data.p_bb || "--";
		},
		getInningsPitched: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.ip !== "undefined") {
				return Math.floor(this._data.ip);
			}
			return Math.floor(this._data.p_ip) || "--";
		},
		getERA: function() {
			//check if we're modeling stats from a named lookup
			if(typeof this._data.era !== "undefined") {
				return this._data.era;
			}
			return this._data.p_era || "--";
		},
		getStatByPropName: function(prop) {
			switch(prop) {
				case "s_type":
					return this.getStatType();
				case "pts":
					return this.getPoints();
				case "w":
					return this.getWins();
				case "k":
					return this.getStrikeouts();
				case "sho":
					return this.getShutouts();
				case "h":
					return this.getHits();
				case "bb":
					return this.getWalks();
				case "ip":
					return this.getInningsPitched();
				case "era":
					return this.getERA();
			}
		}
	};

	return PitcherStatsVO;
});