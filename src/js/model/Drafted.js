define("model/Drafted", function( require, exports, module ) {

	var _controller,
		_data,
		_dataArray = [],
		_currentRound,
		_playersByOwner = {},
		_playerIndices = {},
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager"),
		draftedplayerVO = require("model/vo/DraftedPlayerVO");

	function loadDrafted(leagueID) {
		$.ajax({
			url: dataPathManager.getDataPath("drafted"),/*"/mlb/fantasy/wsfb/draft/live/oob/drafted.jsp?lid="+leagueID*/
			dataType: "xml",
			success: function(resp) {
				setData($.xml2json(resp));
				_controller.dispatchEvent(eventEnums.DRAFTED_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.DRAFTED_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data;
		for(var i=0,l=_data.player.length;i<l;i++) {
			var tmpPlayer = new draftedplayerVO();
			tmpPlayer.setData(_data.player[i]);
			_playerIndices[_data.player[i].pid] = i;
			if(typeof _playersByOwner[_data.player[i].owner] === "undefined") {
				_playersByOwner[_data.player[i].owner] = [ tmpPlayer ];
			} else {
				_playersByOwner[_data.player[i].owner].push(tmpPlayer);
			}
			//set player as drafted
			_controller.getPlayerRoster().setPlayerDrafted(tmpPlayer.getPlayerID());
			_dataArray.push(tmpPlayer);
			//set current round
			_currentRound = _data.player[i].round;
		}
	}
	
	exports.loadDrafted = function(leagueID, controller) {
		_controller = controller;
		loadDrafted(leagueID);
	};

	exports.getDraftedPlayers = function() {
		return _dataArray;
	};

	exports.getDraftedPlayersByOwnerID = function(ownerID) {
		return _playersByOwner[ownerID];
	};

	exports.getDraftedPlayerByPlayerID = function(playerID) {
		return _dataArray[_playerIndices[playerID]];
	};

	exports.getCurrentRound = function() {
		return _currentRound;
	};

	exports.getDraftedPlayersByRound = function(round) {
		if(typeof round === "undefined") round = _currentRound;
		var tmpPlayers = [];
		for(var i=0,l=_dataArray.length;i<l;i++) {
			if(_dataArray[i].getRoundNum() === round) {
				tmpPlayers.push(_dataArray[i]);
			}
		}
		return tmpPlayers;
	};
});