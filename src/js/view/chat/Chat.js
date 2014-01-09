define("view/chat/Chat", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		eventEnums = require("enums/EventEnums");

	return AbstractFantasyDraftView.extend({
		label: "chat",
		handlePlayerDrafted: function(evt, args) {
			var playerDrafted = args;
		},
		init: function(div, template) {
			this._super(div, template);

			this.connect([{event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)}]);
		}
	});
});