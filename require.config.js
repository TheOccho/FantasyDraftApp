requirejs.config({
	baseUrl: requireBaseUrl
});

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}
// KICKOFF THE APP
require(["main"], function(main) {
	var leagueID = getUrlVars()["leagueID"];
	var managerID = getUrlVars()["managerID"];
	main.init(leagueID, managerID);
});