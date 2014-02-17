define("model/League", function( require, exports, module ) {

	var _controller,
		_data,
		_managers = [],
		_managersHash = {},
		_totalDraftedTally = {"c":0,"1b":0,"2b":0,"ss":0,"3b":0,"of":0,"u":0,"p":0},
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager"),
		managerVO = require("model/vo/ManagerVO"),
		_leagueID;

	function loadLeague(leagueID) {
		_leagueID = leagueID;
		$.ajax({
			url: dataPathManager.getDataPath("league")+"?lid="+leagueID,
			dataType: "json",
			success: function(resp) {
				setData(resp);
				_controller.dispatchEvent(eventEnums.LEAGUE_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.LEAGUE_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data.wsfb_league.queryResults.row;
		for(var i=0,l=_data.length;i<l;i++) {
			var tmpManager = new managerVO();
			tmpManager.setData(_data[i]);
			_managersHash[tmpManager.getID()] = i;
			_managers.push(tmpManager);
		}
	}
	
	exports.loadLeague = function(leagueID, controller) {
		_controller = controller;
		loadLeague(leagueID);
	};

	exports.getManagers = function() {
		return _managers.slice(0);
	};

	exports.getManagerByID = function(managerID) {
		return _managers[_managersHash[managerID]];
	};

	exports.getNumManagers = function() {
		return _managers.length;
	};

	exports.getLeagueID = function() {
		return _leagueID;
	};

	exports.getLeagueName = function() {
		return _data[0].league_name || "";
	};

	exports.getTotalRounds = function() {
		return +_data[0].total_rounds || "";
	};

	exports.getTotalPicks = function() {
		return _managers.length * +_data[0].total_rounds;
	};

	exports.updateDraftedPlayerTally = function(managerID, position) {
		_managers[_managersHash[managerID]].updateDraftedPlayerTally(position);
		_totalDraftedTally[position]++;
	};

	exports.getManagerDraftTally = function(managerID) {
		return _managers[_managersHash[managerID]].getDraftedTally();
	};

	exports.getTotalDraftedTally = function() {
		return _totalDraftedTally;
	};
});