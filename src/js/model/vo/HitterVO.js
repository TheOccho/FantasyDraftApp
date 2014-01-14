define("model/vo/HitterVO", function( require, exports, module ) {

	/*<player id="545361" first="Mike" last="Trout" age="22" pos="OF" q_pos="OF|U" team="laa" rank="1" has_injury="n" has_news="n">
      <stats s_type="curr" pts="72" ab="75" doubles="7" hr="2" h="23" rbi="11" bb="5" avg=".307" r="12" sb="3" />
      <stats s_type="last" pts="687" ab="559" doubles="27" hr="30" h="182" rbi="83" bb="67" avg=".326" r="129" sb="49" />
      <stats s_type="proj" pts="671" ab="620" doubles="27" hr="28" h="190" rbi="80" bb="67" avg=".306" r="118" sb="47" />
      <stats s_type="avg" pts="177" ab="152" doubles="7" hr="8" h="47" rbi="22" bb="17" avg=".309" r="33" sb="12" />
   </player>*/

    var statsvo = require("model/vo/HitterStatsVO"); 

	function HitterVO() {
		this._data;
		this._isDrafted = false;
	}

	HitterVO.prototype = {
		setData: function(data) {
			this._data = data;

			//create stats vo's
			var tmpStatsHash = {curr:undefined, last:undefined, proj: undefined, avg: undefined};
			for(var i=0,l=data.stats.length;i<l;i++) {
				var tmpStatsVO = new statsvo();
				tmpStatsVO.setData(data.stats[i]);
				tmpStatsHash[data.stats[i].s_type] = tmpStatsVO;
			}
			this._data.stats = tmpStatsHash;
		},
		getPlayerID: function() {
			return this._data.id || "";
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
			var arr = this._data.q_pos.split("|");
			//remove the U (but not if it's the only qualified pos)
			if(arr.length > 1) arr.pop();
			return (arr.length > 0) ? arr : "";
		},
		getTeamAbbrev: function() {
			return this._data.team || "";
		},
		getRank: function() {
			return this._data.rank || "";
		},
		getHasInjury: function() {
			return (typeof this._data.has_injury !== "undefined") ? this._data.has_injury : "n";
		},
		getHasNews: function() {
			return (typeof this._data.has_news !== "undefined") ? this._data.has_news : "n";
		},
		getCurrentStats: function() {
			return this._data.stats.curr;
		},
		getLastYearStats: function() {
			return this._data.stats.last;
		},
		getProjectedStats: function() {
			return this._data.stats.proj;
		},
		getThreeYearAvgStats: function() {
			return this._data.stats.avg;
		},
		getIsDrafted: function() {
			return this._isDrafted;
		},
		setIsDrafted: function(bool) {
			this._isDrafted = bool;
		},
		getStatsByTypeName: function(type) {
			switch(type) {
				case "curr":
					return this.getCurrentStats();
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