define("view/AbstractFantasyDraftView", function( require, exports, module ) {

	var controller = require("controller/FantasyDraftController"),
		templatelib = require("model/TemplateLibrary");

	return JClass.extend({
		__addListeners: function(listeners) {
			var lngth = listeners.length;
			for (var i = 0; i < lngth; i++) {
				if ( window.console && console.log ) console.log(this.label + " is subscribing to " + listeners[i].event);
				controller.bind(listeners[i].event, listeners[i].handler);
			};
		},
		__removeListeners: function(disinterests) {
			var lngth = disinterests.length;
			for (var i = 0; i < lngth; i++) {
				if ( window.console && console.log ) console.log(this.label + " is unsubscribing to " + disinterests[i].event);
				controller.unbind(disinterests[i].event, disinterests[i].handler);
			};
		},
		init: function(div, template) {
			this.__targetDiv = div;
			this.__templateURL = template;
			this.element = $(this.__targetDiv);

			//attach tpl to targetDiv
			this.element.append($.template(templatelib.getTemplateByID(this.__templateURL), {}, true));
		},
		connect: function(interests) {
			this.__addListeners(interests);
		},
		destroy: function(disinterests) {
			this.__removeListeners(disinterests);
		}
	});
});