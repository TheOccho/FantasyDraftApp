{%
	var player = this.player;
	var controller = this.controller;
	var playerData = controller.getPlayerRoster().getPlayerByID(player.getPlayerID());
	var ownerData = controller.getLeague().getManagerByID(player.getOwner());
%}
<tr data-pid="{%= playerData.getPlayerID() %}">
	<td>{%= player.getPickNum() %}</td>
	<td>{%= playerData.getFirstName().charAt(0) + ". " + playerData.getLastName() %}<br/><span class="player-team-pos">{%= playerData.getTeamAbbrev().toUpperCase() %} - {%= playerData.getQualifiedPositions().join(", ") %}</span></td>
	<td>{%= (ownerData.getName().length > 14) ? ownerData.getName().substr(0, 14)+"..." : ownerData.getName() %}</td>
</tr>