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
			url: dataPathManager.getDataPath("player_roster"),/*"/fantasylookup/rawjson/named.wsfb_draft_roster_player_tpl.bam*/
			dataType: "json",
			success: function(resp) {
				setData(resp);
				_controller.dispatchEvent(eventEnums.PLAYER_ROSTER_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.PLAYER_ROSTER_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data.row;
		var hasCustomRanks = _controller.getManager().hasCustomRanks();
		for(var i=0,l=_data.length;i<l;i++) {
			var tmpPlayer;
			if(_data[i].pos === "PS") {
				tmpPlayer = new pitcherVO();
			} else {
				tmpPlayer = new hitterVO();
			}
			//add custom rank to player data object
			_data[i].custom_rank = (hasCustomRanks) ? _controller.getManager().getCustomRankByPlayerID(_data[i].player_id) : _data[i].rank;
			tmpPlayer.setData(_data[i]);
			_playerIndices[_data[i].player_id] = i;
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