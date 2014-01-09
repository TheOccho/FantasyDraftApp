{%
	var teamName = this.teamName;
	var round = this.round;
	var pick = this.pick;
	var gearIconPath = this.gearIconPath;
%}
<img class="auto-draft-icon hidden" src="{%= gearIconPath %}" />
<span class="team-name">{%= teamName %}</span>
</br>
<div class="footer"><span class="round" data-id="{%= round %}">R{%= round %}</span>: <span class="pick" data-id="{%= pick %}">Pick {%= pick %}</span></div>