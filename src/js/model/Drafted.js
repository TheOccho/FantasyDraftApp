define("model/Drafted", function( require, exports, module ) {

	var _controller,
		_data,
		_dataArray = [],
		_lastPick,
		_lastRound,
		_currentRound = 1,
		_currentPick = 1,
		_overallLastPick = 1,
		_numManagers,
		_lastOwnerToDraft,
		_lastPlayerDrafted,
		_playersByOwner = {},
		_playerIndices = {},
		_currentManagerOnClock,
		eventEnums = require("enums/EventEnums"),
		botEnums = require("enums/BotCommandEnums"),
		dataPathManager = require("data/DataPathManager"),
		draftedplayerVO = require("model/vo/DraftedPlayerVO");

	function loadDrafted(leagueID) {
		$.ajax({
			url: dataPathManager.getDataPath("drafted")+"?lid="+leagueID,
			dataType: "json",
			success: function(resp) {
				setData(resp);
				_controller.dispatchEvent(eventEnums.DRAFTED_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.DRAFTED_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data.wsfb_drafted.queryResults.row;
		_numManagers = _controller.getLeague().getNumManagers();
		if(+data.wsfb_drafted.queryResults.totalSize === 0) {
			_controller.setDraftIsLive(false);
			return;
		}
		for(var i=0,l=_data.length;i<l;i++) {
			handleIndividualPlayerDrafted(_data[i], i);
		}
		//check if draft has ended
		if(+data.wsfb_drafted.queryResults.totalSize === (_numManagers * _controller.getLeague().getTotalRounds())) {
			_controller.setDraftIsLive(false);
		}
	}

	function handleIndividualPlayerDrafted(playerObj, index) {
		var tmpPlayer = new draftedplayerVO();
		tmpPlayer.setData(playerObj);
		_playerIndices[tmpPlayer.getPlayerID()] = index;
		if(typeof _playersByOwner[playerObj.owner] === "undefined") {
			_playersByOwner[playerObj.owner] = [ tmpPlayer ];
		} else {
			_playersByOwner[playerObj.owner].push(tmpPlayer);
		}
		//set player as drafted
		_controller.getPlayerRoster().setPlayerDrafted(tmpPlayer.getPlayerID());
		//update the draft tally
		if(tmpPlayer.getPosition().toLowerCase() !== "bn") {
			_controller.getLeague().updateDraftedPlayerTally(tmpPlayer.getOwnerID(), tmpPlayer.getPosition().toLowerCase());
		} else {
			var primaryPosition = _controller.getPlayerRoster().getPlayerByID(tmpPlayer.getPlayerID()).getPrimaryPosition();
			_controller.getLeague().updateDraftedPlayerTally(tmpPlayer.getOwnerID(), primaryPosition.toLowerCase());
		}
		_dataArray.push(tmpPlayer);
		//set last owner/player to draft and be drafted
		_lastOwnerToDraft = tmpPlayer.getOwnerID();
		_lastPlayerDrafted = tmpPlayer.getPlayerID();
		//set last round/pick
		_lastRound = Number(tmpPlayer.getRoundNum());
		_lastPick = Number(tmpPlayer.getPickNum());
		//set current round/pick/overall pick
		_currentRound = (+playerObj.pick === _numManagers) ? _lastRound + 1 : _lastRound;
		_currentPick = (+playerObj.pick === _numManagers) ? 1 : _lastPick + 1;
		if(_currentRound > 1) {
			_overallLastPick = ((_currentRound - 1) * _numManagers) + (Number(_currentPick) - 1);
		} else {
			_overallLastPick = Number(_currentPick) - 1;
		}
		if(_overallLastPick === _controller.getLeague().getTotalPicks()) {
			//draft is over
			_controller.setDraftIsLive(false);
			_controller.dispatchEvent(botEnums.SET_CLOCK_HEADER, [ "DRAFT IS OVER" ]);
			//_controller.dispatchEvent(botEnums.SHOW_POST_DRAFT_DIALOG);
		}
	}
	
	exports.loadDrafted = function(leagueID, controller) {
		_controller = controller;
		loadDrafted(leagueID);
	};

	exports.getDraftedPlayers = function() {
		return _dataArray.slice(0);
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

	exports.getCurrentPick = function() {
		return _currentPick;
	};

	exports.getOverallLastPick = function(formatted) {
		if(formatted) {
			var j = _overallLastPick % 10;
	        if (j == 1 && _overallLastPick != 11) {
	            return _overallLastPick + "st";
	        }
	        if (j == 2 && _overallLastPick != 12) {
	            return _overallLastPick + "nd";
	        }
	        if (j == 3 && _overallLastPick != 13) {
	            return _overallLastPick + "rd";
	        }
	        return _overallLastPick + "th";
		} else {
			return +_overallLastPick;
		}
	};

	exports.getLastRound = function() {
		return _lastRound;
	};

	exports.getLastPick = function() {
		return _lastPick;
	};

	exports.getLastOwnerToDraft = function() {
		return _lastOwnerToDraft;
	};

	exports.getLastPlayerDrafted = function() {
		return _lastPlayerDrafted;
	};

	exports.setPlayerDrafted = function(pid, pos, owner, round, pick) {
		//do the actual adding of the drafted player by creating a DraftedPlayerVO and appending him to our internal array
		handleIndividualPlayerDrafted({round: round, pick: pick, owner: owner, pid: pid, pos: pos}, _dataArray.length);

		//dispatch player drafted event so views can update themselves
		_controller.dispatchEvent(eventEnums.PLAYER_DRAFTED, [ _dataArray[_playerIndices[pid]] ]);
	};

	exports.getDraftedPlayersByRound = function(round) {
		if(typeof round === "undefined") round = _currentRound;
		var tmpPlayers = [];
		for(var i=0,l=_dataArray.length;i<l;i++) {
			if(+_dataArray[i].getRoundNum() === +round) {
				tmpPlayers.push(_dataArray[i]);
			}
		}
		return tmpPlayers;
	};
});