{%
	var playerData = this.playerData;
	var hasInjury = playerData.getHasInjury() === "y";
	var hasNews = playerData.getHasNews() === "y";
	var stats = this.stats;
	var news = this.news;
	var injury = this.injury;
	var preview = this.preview;
	var mugshotURL = (playerData.getType() === "pitcher") ? "http://mlb.mlb.com/mlb/fantasy/wsfb/images/mugshots/"+playerData.getTeamAbbrev()+"_staff_90x135.jpg" : "http://mlb.mlb.com/images/players/mugshot/ph_"+playerData.getPlayerID()+".jpg";

	function getYear(i) {
		switch(i) {
			case 0:
				return "2012";
			case 1:
				return "2013";
			case 2:
				return "2014<sup>*</sup>";
		}
	}
%}
<div class="playercard-wrapper">
	<img class="mugshot" src="{%= mugshotURL %}" onerror="this.setAttribute('src','http://mlb.mlb.com/images/players/mugshot/ph_default.jpg');" />
	<span class="player-name">{%= playerData.getFullName() %}</span>
	<span class="player-pos-team">{%= playerData.getQualifiedPositions().join(", ") %} - {%= playerData.getTeamAbbrev().toUpperCase() %}</span>
	{% if(playerData.getType() === "hitter") { %}<span class="player-age">Age: {%= playerData.getAge() %}</span>{% } %}
	<table id="player-card-table">
		<thead>
			{% if(playerData.getType() === "pitcher") { %}
				<th>Year</th>
				<th>ERA</th>
				<th>W</th>
				<th>IP</th>
				<th>K</th>
				<th>Pts</th>
			{% } else if(playerData.getType() === "hitter") { %}
				<th>Year</th>
				<th>AVG</th>
				<th>HR</th>
				<th>RBI</th>
				<th>SB</th>
				<th>Pts</th>
			{% } %}
		</thead>
		<tbody>
			{% for(var i=0;i<3;i++) { %}
				{% if(playerData.getType() === "hitter") { %}
					<tr><td>{%= getYear(i) %}</td><td>{%= stats[i].getAVG() %}</td><td>{%= stats[i].getHomeruns() %}</td><td>{%= stats[i].getRBI() %}</td><td>{%= stats[i].getStolenBases() %}</td><td>{%= stats[i].getPoints() %}</td></tr>
				{% } else if(playerData.getType() === "pitcher") { %}
					<tr><td>{%= getYear(i) %}</td><td>{%= stats[i].getERA() %}</td><td>{%= stats[i].getWins() %}</td><td>{%= stats[i].getInningsPitched() %}</td><td>{%= stats[i].getStrikeouts() %}</td><td>{%= stats[i].getPoints() %}</td></tr>
				{% } %}
			{% } %}
		<tbody>
	</table>
	<span class="asterisk-desc"><sup>*</sup> Based on 2014 projections</span>
	<ul id="news-tabs">
		<li data-id="preview" class="tab selected">2014 Preview</li>
		<li data-id="fantasy" class="tab">Notes</li>
	</ul>
	<div id="preview-notes" class="notes">{% if(typeof preview.preview !== "undefined") { %}{%= preview.preview %}{% if(typeof preview.one_liner !== "undefined" && preview.one_liner !== "") { %}</br></br><b>Fantasy Bottom Line:</b> {%= preview.one_liner %}{% } %}{% } else { %}<p>There is no Fantasy Preview for this player.</p>{% } %}</div>
	<div id="fantasy-notes" class="notes">
		<h3>Fantasy Notes:</h3>
			{% if(news.length > 0) { %}
				{% for(var i=0,l=news.length;i<l;i++) { %}
					<div><b>{%= news[i].display_ts %}</b> - {%= news[i].story %}</br></br>{%= news[i].spin %}</div>
					{% if(i!==l-1) { %}</br>{% } %}
				{% } %}
			{% } else { %}
				<p>There are no current Fantasy Notes for this player.</p>
			{% } %}
		<h3 style="margin-top:10px;">Injury Updates:</h3>
			{% if(injury.length > 0) { %}
				{% for(var i=0,l=injury.length;i<l;i++) { %}
					<div><b>{%= injury[i].display_ts %}</b> - {%= injury[i].injury_desc %}, Injury Status: {%= injury[i].injury_status %}. {%= injury[i].injury_update %} Due Back: {%= injury[i].due_back %}.</div>
					{% if(i!==l-1) { %}</br>{% } %}
				{% } %}
			{% } else { %}
				<p>There are no current Injury Updates for this player.</p>
			{% } %}
	</div>
</div>