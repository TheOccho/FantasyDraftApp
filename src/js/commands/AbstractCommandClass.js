define("commands/AbstractCommandClass", function( require, exports, module ) {

	return JClass.extend({
		label: "Fantasy Draft Abstract Command",
		execute: function() {
			console.log("Have you forgotten to override the execute function in " + this.label + "?");
		}
	});
});