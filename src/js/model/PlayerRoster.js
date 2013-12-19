define("model/PlayerRoster", function( require, exports, module ) {

	var _controller,
		_data,
		_dataArray = [],
		_playerIndices = {},
		hitterVO = require("model/vo/HitterVO"),
		pitcherVO = require("model/vo/PitcherVO"),
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager"),
		_hitters = [],
		_pitchers = [],
		_catchers = [],
		_firstBasemen = [],
		_secondBasemen = [],
		_shortstops = [],
		_thirdBasemen = [],
		_outfielders = [];

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
			//add to _hitters/_pitchers
			if(_data.player[i].pos !== "P") {
				_hitters.push(tmpPlayer);
			} else {
				_pitchers.push(tmpPlayer);
			}
			switch(tmpPlayer.getPrimaryPosition().toLowerCase()) {
				case "c":
					_catchers.push(tmpPlayer);
					break;
				case "1b":
					_firstBasemen.push(tmpPlayer);
					break;
				case "2b":
					_secondBasemen.push(tmpPlayer);
					break;
				case "ss":
					_shortstops.push(tmpPlayer);
					break;
				case "3b":
					_thirdBasemen.push(tmpPlayer);
					break;
				case "of":
					_outfielders.push(tmpPlayer);
					break;
			}
		}
	}
	
	exports.loadPlayerRoster = function(controller) {
		_controller = controller;
		loadPlayerRoster();
	};

	exports.getAllPitchers = function() {
		return _pitchers;
	};

	exports.getAllHitters = function() {
		return _hitters;
	};

	exports.getCatchers = function() {
		return _catchers;
	};

	exports.getFirstBasemen = function() {
		return _firstBasemen;
	};

	exports.getSecondBasemen = function() {
		return _secondBasemen;
	};

	exports.getShortstops = function() {
		return _shortstops;
	};

	exports.getThirdBasemen = function() {
		return _thirdBasemen;
	};

	exports.getOutfielders = function() {
		return _outfielders;
	};

	exports.getPlayerByID = function(pid) {
		return _dataArray[_playerIndices[pid]];
	};

	exports.setPlayerDrafted = function(pid) {
		_dataArray[_playerIndices[pid]].setIsDrafted(true);
	};
});