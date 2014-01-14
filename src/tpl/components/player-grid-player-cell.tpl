{%
	var playerData = this.playerData;
	var hasInjury = playerData.getHasInjury() === "y";
	var hasNews = playerData.getHasNews() === "y";
	var injuryIconPath = this.injuryIconPath;
	var newsIconPath = this.newsIconPath;
%}
{%= playerData.getFirstName().charAt(0) %}. {%= playerData.getLastName() %}
<img class="icon injury" style="{% if(hasInjury) { %}display:inline-block;{% } %}" src="{%= injuryIconPath %}"/>
<img class="icon news" style="{% if(hasNews) { %}display:inline-block;{% } %}" src="{%= newsIconPath %}" />
</br>
<span class="player-team-pos">{%= playerData.getTeamAbbrev().toUpperCase() %} - {%= playerData.getQualifiedPositions().join(", ") %}</span>