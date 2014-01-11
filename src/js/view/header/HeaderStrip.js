define("view/header/HeaderStrip", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView");

	return AbstractFantasyDraftView.extend({
		label: "header strip",
		addViewListeners: function() {
			var that = this;

			//draft order link click
			$(document).on("click", this.__targetDiv + " span.draft-order", function(e) {
				console.log("draft order click");
			});

			//league rules link click
			$(document).on("click", this.__targetDiv + " span.league-rules", function(e) {
				console.log("league rules click");
			});
		},
		init: function(div, template) {
			this._super(div, template);

			this.addViewListeners();
		}
	});
});