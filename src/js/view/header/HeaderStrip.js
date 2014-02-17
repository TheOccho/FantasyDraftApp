define("view/header/HeaderStrip", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		eventEnums = require("enums/EventEnums");

	return AbstractFantasyDraftView.extend({
		label: "header strip",
		addViewListeners: function() {
			var that = this;
			//draft order link click
			$(document).on("click", this.__targetDiv + " span.draft-order", function(e) {
				controller.dispatchEvent(eventEnums.SHOW_DRAFT_ORDER_DIALOG);
			});

			//league rules link click
			$(document).on("click", this.__targetDiv + " span.league-rules", function(e) {
				//open the user's league homepage in a new tab
				window.open("/mlb/fantasy/fb/info/rules.jsp", "_blank");
			});
		},
		init: function(div, template) {
			this._super(div, template);

			this.addViewListeners();
		}
	}).prototype;
});