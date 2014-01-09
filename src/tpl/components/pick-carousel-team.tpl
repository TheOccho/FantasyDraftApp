{%
	var teamName = this.teamName;
	var round = this.round;
	var pick = this.pick;
	var gearIconPathGrey = this.gearIconPathGrey;
	var gearIconPathWhite = this.gearIconPathWhite;
%}
<img class="auto-draft-icon white hidden" src="{%= gearIconPathWhite %}" />
<img class="auto-draft-icon grey hidden" src="{%= gearIconPathGrey %}" />
<span class="team-name">{%= teamName %}</span>
</br>
<div class="footer"><span class="round" data-id="{%= round %}">R{%= round %}</span>: <span class="pick" data-id="{%= pick %}">Pick {%= pick %}</span></div>