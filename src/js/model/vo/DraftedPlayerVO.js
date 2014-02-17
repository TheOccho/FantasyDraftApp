define("model/vo/DraftedPlayerVO", function( require, exports, module ) {

	function DraftedPlayerVO() {
		this._data;
	}

	DraftedPlayerVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getPlayerID: function() {
			return this._data.pid || "";
		},
		getPosition: function() {
			return this._data.pos || "";
		},
		getOwnerID: function() {
			return this._data.owner || "";
		},
		getRoundNum: function() {
			return this._data.round || "";
		},
		getPickNum: function() {
			return this._data.pick || "";
		}
	};

	return DraftedPlayerVO;
});