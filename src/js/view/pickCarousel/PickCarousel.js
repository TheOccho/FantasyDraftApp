define("view/pickCarousel/PickCarousel", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView");

	return AbstractFantasyDraftView.extend({
		label: "pick carousel",
		init: function(div, template) {
			this._super(div, template);

			//this.connect([{event:"FantasyDraft.RANDOM_EVENT", handler:this.handleSomeEvent}]);
		}
	});
});