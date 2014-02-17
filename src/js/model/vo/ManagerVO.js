define("model/vo/ManagerVO", function( require, exports, module ) {

	function ManagerVO() {
		this._data;
		this._draftedTally = {"c":0,"1b":0,"2b":0,"ss":0,"3b":0,"of":0,"u":0,"p":0};
	}

	ManagerVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getID: function() {
			return this._data.team_id || "";
		},
		getName: function() {
			return this._data.team_name || "";
		},
		getLogo: function() {
			return this._data.team_logo || "";
		},
		updateDraftedPlayerTally: function(position) {
			this._draftedTally[position]++;
		},
		getDraftedTally: function() {
			return this._draftedTally;
		}
	};

	return ManagerVO;
});