define("model/vo/ManagerVO", function( require, exports, module ) {

	/*<<m id="347558" name="Test-Live-347558 8/9 1:01 PM" logo="" />*/

	function ManagerVO() {
		this._data;
		this._draftedTally = {"c":0,"1b":0,"2b":0,"ss":0,"3b":0,"of":0,"u":0,"p":0};
	}

	ManagerVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getID: function() {
			return this._data.id || "";
		},
		getName: function() {
			return this._data.name || "";
		},
		getLogo: function() {
			return this._data.logo || "";
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