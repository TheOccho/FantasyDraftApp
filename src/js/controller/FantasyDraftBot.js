define("controller/FantasyDraftBot", function( require, exports, module ) {
	var instance = null,
		BOSH_SERVICE = "http://d1engbuild01.dev.mlbam.com:7070/http-bind/",
		botEnums = require("enums/BotCommandEnums"),
		controller = require("controller/FantasyDraftController"),
		_connection = null,
		_jidResource = "xiff",
		_password = "G0ss@g3",
		_connections = {"chat":"", "bot":""},
		_leagueID,
		_managerID;

	function FantasyDraftBot() {
		if(instance !== null){
			throw new Error("Cannot instantiate more than one FantasyDraftBot, use FantasyDraftBot.getInstance()");
		}
	}

	function rawInput(data) {
		var jabberJSON = $.xml2json(data);
	    if(typeof jabberJSON.message !== "undefined") {
	    	jabberJSON.message = $.ensureArray(jabberJSON.message);
	    	for(var i=0,l=jabberJSON.message.length;i<l;i++) {
	    		if(typeof jabberJSON.message[i].body !== "undefined") {
	    			controller.dispatchEvent(botEnums.RENDER_NEW_CHAT_MESSAGE, [ {managerID: jabberJSON.message[i].from.split("/")[1].substr(5), message: jabberJSON.message[i].body} ]);
	    		}
	    	}
	    }
	}

	function rawOutput(data) {

	}

	function connectToChatRoom() {
		_connection.muc.join(_connections["chat"], "guest"+_managerID, function(msg_handler){
			//console.dir(msg_handler);
		}, function(pres_handler) {
			//console.dir(pres_handler);
		}, function(roster) {
			//console.dir(roster);
		}, _password);
	}

	function onConnect(status) {
		if (status == Strophe.Status.CONNECTING) {
			console.log('Strophe is connecting.');
	    } else if (status == Strophe.Status.CONNFAIL) {
			console.log('Strophe failed to connect.');
	    } else if (status == Strophe.Status.DISCONNECTING) {
			console.log('Strophe is disconnecting.');
	    } else if (status == Strophe.Status.DISCONNECTED) {
			console.log('Strophe is disconnected.');
	    } else if (status == Strophe.Status.CONNECTED) {
	    	console.log('Strophe is connected.');
	    	connectToChatRoom();
	    }
	}

	function connect() {
		_connection = new Strophe.Connection(BOSH_SERVICE);
	    _connection.rawInput = rawInput;
	    _connection.rawOutput = rawOutput;

	    _connection.connect("m"+_managerID+"@d1engbuild01.dev.mlbam.com/"+_jidResource, _password, onConnect);
	}

	FantasyDraftBot.prototype = {
		init: function(leagueID, managerID, chatServer, botServer) {
			_leagueID = leagueID;
			_managerID = managerID;
			_connections["chat"] = chatServer;
			_connections["bot"] = botServer;

			//connect();
		},
		sendChatMessage: function(msg) {
			_connection.muc.message(_connections["chat"], null, msg);
		}
	};

	FantasyDraftBot.getInstance = function() {
		// Gets an instance of the singleton. It is better to use
		if(instance === null){
			instance = new FantasyDraftBot();
		}
		return instance;
	};
	
	$.bindable(FantasyDraftBot.prototype);

	return FantasyDraftBot.getInstance();
});