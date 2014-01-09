define("model/League", function( require, exports, module ) {

	/*<league id="30871" name="MLB-30871" total_rounds="16">
	   <managers>
	   ...
	   </managers>
  	</league>*/

	var _controller,
		_data,
		_managers = [],
		_managersHash = {},
		_totalDraftedTally = {"c":0,"1b":0,"2b":0,"ss":0,"3b":0,"of":0,"u":0,"p":0},
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager"),
		managerVO = require("model/vo/ManagerVO");

	function loadLeague(leagueID) {
		$.ajax({
			url: dataPathManager.getDataPath("league"),/*"/mlb/fantasy/wsfb/draft/live/oob/league.jsp?lid="+leagueID*/
			dataType: "xml",
			success: function(resp) {
				setData($.xml2json(resp));
				_controller.dispatchEvent(eventEnums.LEAGUE_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.LEAGUE_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data;
		for(var i=0,l=_data.managers.m.length;i<l;i++) {
			var tmpManager = new managerVO();
			tmpManager.setData(_data.managers.m[i]);
			_managersHash[tmpManager.getID()] = i;
			_managers.push(tmpManager);
		}
	}
	
	exports.loadLeague = function(leagueID, controller) {
		_controller = controller;
		loadLeague(leagueID);
	};

	exports.getBotServer = function() {
		return _data.connections.bot;
	};

	exports.getChatServer = function() {
		return _data.connections.chat;
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
		return _data.id || "";
	};

	exports.getLeagueName = function() {
		return _data.name || "";
	};

	exports.getTotalRounds = function() {
		return _data.total_rounds || "";
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