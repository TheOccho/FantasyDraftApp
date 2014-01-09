define("model/vo/PitcherVO", function( require, exports, module ) {

	/*<player id="147" first="New York" last="Yankees" age="0" pos="P" q_pos="P" team="nyy" rank="505"> 
      <stats s_type="curr" pts="113" w="10" k="132" sho="3" h="162" bb="50" ip="155" era="4.01"/>
      <stats s_type="last" pts="1155" w="95" k="1318" sho="9" h="1401" bb="431" ip="1445.1" era="3.85"/>
      <stats s_type="proj" pts="1143" w="88" k="1288" sho="7" h="1410" bb="445" ip="1446" era="3.90"/>
      <stats s_type="avg" pts="1092" w="96" k="1231" sho="8" h="1391" bb="493" ip="1448.2" era="3.88"/>
   </player>*/

    var statsvo = require("model/vo/PitcherStatsVO"); 

	function PitcherVO() {
		this._data;
		this._isDrafted = false;
	}

	PitcherVO.prototype = {
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
			return (this._data.q_pos) ? [ this._data.q_pos ] : [];
		},
		getTeamAbbrev: function() {
			return this._data.team || "";
		},
		getRank: function() {
			return this._data.rank || "";
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

	return PitcherVO;
});