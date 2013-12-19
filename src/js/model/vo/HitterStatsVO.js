define("model/vo/HitterStatsVO", function( require, exports, module ) {

	/*<stats s_type="curr" pts="72" ab="75" doubles="7" hr="2" h="23" rbi="11" bb="5" avg=".307" r="12" sb="3" />*/

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
			return this._data.pts || "";
		},
		getAtBats: function() {
			return this._data.ab || "";
		},
		getDoubles: function() {
			return this._data.doubles || "";
		},
		getHomeruns: function() {
			return this._data.hr || "";
		},
		getHits: function() {
			return this._data.h || "";
		},
		getRBI: function() {
			return this._data.rbi || "";
		},
		getBB: function() {
			return this._data.bb || "";
		},
		getAVG: function() {
			return this._data.avg || "";
		},
		getRuns: function() {
			return this._data.r || "";
		},
		getStolenBases: function() {
			return this._data.sb || "";
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