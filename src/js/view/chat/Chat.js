define("view/chat/Chat", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView");

	return AbstractFantasyDraftView.extend({
		label: "chat",
		init: function(div, template) {
			this._super(div, template);

			//this.connect([{event:"FantasyDraft.RANDOM_EVENT", handler:this.handleSomeEvent}]);
		}
	});
});