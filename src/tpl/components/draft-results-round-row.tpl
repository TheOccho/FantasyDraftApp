{%
	var player = this.player;
	var controller = this.controller;
	var playerData = controller.getPlayerRoster().getPlayerByID(player.getPlayerID());
	var ownerData = controller.getLeague().getManagerByID(player.getOwnerID());
%}
<tr data-pid="{%= playerData.getPlayerID() %}">
	<td>{%= player.getPickNum() %}</td>
	<td>{% if(playerData.getType() === "hitter") { %}{%= playerData.getFirstName().charAt(0) + ". " + playerData.getLastName() %}{% } else if(playerData.getType() === "pitcher") { %}{%= playerData.getLastName() %}{% } %}<br/><span class="player-team-pos">{%= playerData.getTeamAbbrev().toUpperCase() %} - {%= playerData.getQualifiedPositions().join(", ") %}</span></td>
	<td>{%= (ownerData.getName().length > 10) ? ownerData.getName().substr(0, 10)+"..." : ownerData.getName() %}</td>
</tr>