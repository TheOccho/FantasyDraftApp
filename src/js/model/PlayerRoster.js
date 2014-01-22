define("model/PlayerRoster", function( require, exports, module ) {

	var _controller,
		_data,
		_dataArray = [],
		_playerIndices = {},
		hitterVO = require("model/vo/HitterVO"),
		pitcherVO = require("model/vo/PitcherVO"),
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager");

	function loadPlayerRoster() {
		$.ajax({
			url: dataPathManager.getDataPath("player_roster"),/*"/mlb/fantasy/wsfb/draft/live/gen/player_roster.xml*/
			dataType: "xml",
			success: function(resp) {
				setData($.xml2json(resp));
				_controller.dispatchEvent(eventEnums.PLAYER_ROSTER_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.PLAYER_ROSTER_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data;
		for(var i=0,l=_data.player.length;i<l;i++) {
			var tmpPlayer;
			if(_data.player[i].pos === "P") {
				tmpPlayer = new pitcherVO();
			} else {
				tmpPlayer = new hitterVO();
			}
			tmpPlayer.setData(_data.player[i]);
			_playerIndices[_data.player[i].id] = i;
			_dataArray.push(tmpPlayer);
		}
	}
	
	exports.loadPlayerRoster = function(controller) {
		_controller = controller;
		loadPlayerRoster();
	};

	exports.getAllPlayers = function() {
		return _dataArray.slice(0);
	};

	exports.getPlayerByID = function(pid) {
		return _dataArray[_playerIndices[pid]];
	};

	exports.getPlayerIndexByPID = function(pid) {
		return _playerIndices[pid];
	};

	exports.setPlayerDrafted = function(pid) {
		_dataArray[_playerIndices[pid]].setIsDrafted(true);
	};
});