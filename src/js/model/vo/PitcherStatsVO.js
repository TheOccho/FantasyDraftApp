define("model/vo/PitcherStatsVO", function( require, exports, module ) {

	/*<stats s_type="curr" pts="113" w="10" k="132" sho="3" h="162" bb="50" ip="155" era="4.01"/>*/

	function PitcherStatsVO() {
		this._data;
	}

	PitcherStatsVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getStatType: function() {
			return this._data.s_type || "";
		},
		getPoints: function() {
			return this._data.pts || "";
		},
		getWins: function() {
			return this._data.w || "";
		},
		getStrikeouts: function() {
			return this._data.k || "";
		},
		getShutouts: function() {
			return this._data.sho || "";
		},
		getHits: function() {
			return this._data.h || "";
		},
		getWalks: function() {
			return this._data.bb || "";
		},
		getInningsPitched: function() {
			return this._data.ip || "";
		},
		getERA: function() {
			return this._data.era || "";
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