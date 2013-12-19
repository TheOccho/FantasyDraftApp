requirejs.config({
	baseUrl: "src/js"
});
// KICKOFF THE APP
require(["main"], function(main) {
	main.init("30871", "347558");
});