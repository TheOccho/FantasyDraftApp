{%
	var rank = this.index+1;
	var player = this.player;
%}
<tr class="{% if(typeof player === "undefined") { %}empty{% } %}" data-pid="{% if(typeof player !== "undefined") { %}{%= player.getPlayerID() %}{% } %}">
	<td width="28px">{%= rank %}</td>
	<td style="text-align:left;" width="124px">{% if(typeof player !== "undefined") { %}{% if(player.getType() === "hitter") { %}{%= player.getFirstName().charAt(0) + ". " + player.getLastName() %}{% } else if(player.getType() === "pitcher") { %}{%= player.getLastName() %}{% } %}<br/><span class="player-team-pos">{%= player.getTeamAbbrev().toUpperCase() %} - {%= player.getQualifiedPositions().join(", ") %}{% } %}</td>
	<td width="22px">{% if(typeof player !== "undefined") { %}{%= player.getProjectedStats().getPoints() %}{% } %}</td>
</tr>