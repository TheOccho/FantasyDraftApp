define("model/Manager", function( require, exports, module ) {

	var _controller,
		_data,
		_customRanks,
		_customRanksHash = {},
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager");

	function loadManager(managerID) {
		$.ajax({
			url: dataPathManager.getDataPath("manager")+"?mid="+managerID,
			dataType: "json",
			success: function(resp) {
				setData(resp);
				_controller.dispatchEvent(eventEnums.MANAGER_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.MANAGER_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data.wsfb_manager.queryResults.row;
		//create custom ranks
		if(_data.ranks === "") {
			_customRanks = [];
		} else {
			_customRanks = _data.ranks.split("|");
			for(var i=0,l=_customRanks.length;i<l;i++) {
				_customRanksHash[_customRanks[i]] = i;
			}
		}
	}
	
	exports.loadManager = function(managerID, controller) {
		_controller = controller;
		loadManager(managerID);
	};

	exports.getID = function() {
		return _data.team_id || "";
	};

	exports.getName = function() {
		return _data.team_name || "";
	};

	exports.getQueue = function() {
		return (_data.queue === "") ? [] : _data.queue.split("|");
	};

	exports.hasCustomRanks = function() {
		return _customRanks.length > 0;
	};

	exports.getCustomRankByPlayerID = function(playerID) {
		return String(_customRanksHash[playerID]+1);
	};
});