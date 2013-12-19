define("view/header/HeaderStrip", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView");

	return AbstractFantasyDraftView.extend({
		label: "header strip",
		init: function(div, template) {
			this._super(div, template);

			//this.connect([{event:"FantasyDraft.RANDOM_EVENT", handler:this.handleSomeEvent}]);
		}
	});
});