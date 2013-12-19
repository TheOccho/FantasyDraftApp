define("model/League", function( require, exports, module ) {

	/*<league id="30871" name="MLB-30871" total_rounds="16">
	   <managers>
	   ...
	   </managers>
  	</league>*/

	var _controller,
		_data,
		_managers = [],
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
		return _managers;
	};

	exports.getManagerByID = function(managerID) {
		for(var i=0,l=_managers.length;i<l;i++) {
			if(_managers[i].getID() === managerID) {
				return _managers[i];
			}
		}
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
});