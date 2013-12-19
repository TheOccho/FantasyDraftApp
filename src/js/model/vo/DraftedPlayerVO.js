define("model/vo/DraftedPlayerVO", function( require, exports, module ) {

	/*<player pid="545361" pos="OF" owner="347558" round="1" pick="1" />*/

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
		getOwner: function() {
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