define("model/Manager", function( require, exports, module ) {

	/*<manager id="347551" name="Test-Live-347551 8/9 1:01 PM">
   		<ranks />
  		<queue />
	</manager>*/

	var _controller,
		_data,
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager");

	function loadManager(managerID) {
		$.ajax({
			url: dataPathManager.getDataPath("manager"),/*"/mlb/fantasy/wsfb/draft/live/oob/manager.jsp?mid="+managerID*/
			dataType: "xml",
			success: function(resp) {
				setData($.xml2json(resp));
				_controller.dispatchEvent(eventEnums.MANAGER_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.MANAGER_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data;
	}
	
	exports.loadManager = function(managerID, controller) {
		_controller = controller;
		loadManager(managerID);
	};

	exports.getID = function() {
		return _data.id || "";
	};

	exports.getName = function() {
		return _data.name || "";
	};

	exports.getQueue = function() {
		return (_data.queue === "") ? [] : _data.queue;
	};

	exports.getRanks = function() {
		return (_data.ranks === "") ? [] : _data.ranks;
	};
});