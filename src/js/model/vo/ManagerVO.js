define("model/vo/ManagerVO", function( require, exports, module ) {

	/*<<m id="347558" name="Test-Live-347558 8/9 1:01 PM" logo="" />*/

	function ManagerVO() {
		this._data;
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
		}
	};

	return ManagerVO;
});