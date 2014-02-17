define("bot/vo/BotMessageVO", function( require, exports, module ) {

	/**
	<message xmlns='jabber:client' id='Fwfmr-963' to='m1236@d1engbuild01.dev.mlbam.com/Smack' type='groupchat' from='c1024@conference.d1engbuild01.dev.mlbam.com/b1024'>
		<body>DRAFT HAS BEGUN. GOOD LUCK!</body>
		<delay xmlns='urn:xmpp:delay' stamp='2014-02-06T20:00:38.151Z' from='b1024@d1engbuild01.dev.mlbam.com/Smack'/>
		<x xmlns='jabber:x:delay' stamp='20140206T20:00:38' from='b1024@d1engbuild01.dev.mlbam.com/Smack'/>
	</message>
	*/

	function BotMessageVO() {
		this._data;
	}

	BotMessageVO.prototype = {
		setData: function(data) {
			this._data = data;
		},
		getID: function() {
			return this._data.id;
		},
		getType: function() {
			return this._data.type || "command";
		},
		getFrom: function() {
			if(this._data.from.split("/").length === 1) {
				return "chatroom";
			} else if(this._data.from.split("/")[1].charAt(0) === "b") {
				return "bot";
			} else {
				return this._data.from.split("/")[1].substr(5) || "";
			}
		},
		getBody: function() {
			return this._data.body || "";
		},
		getTimestamp: function() {
			return this._data.delay.stamp || "";
		}
	};

	return BotMessageVO;
});