{%
	var playerData = this.playerData;
	var hasInjury = playerData.getHasInjury() === "y";
	var hasNews = playerData.getHasNews() === "y";
	var injuryIconPath = this.injuryIconPath;
	var newsIconPath = this.newsIconPath;
	var stats = this.stats;
	var news = this.news;
	var preview = this.preview;
	var mugshotURL = "http://mlb.mlb.com/images/players/mugshot/ph_"+playerData.getPlayerID()+".jpg";

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
	<img class="icon injury" style="{% if(hasInjury) { %}display:block;{% } %}" src="{%= injuryIconPath %}"/>
	<img class="icon news" style="{% if(hasNews) { %}display:block;{% } %}" src="{%= newsIconPath %}" />
	<span class="player-pos-team">{%= playerData.getQualifiedPositions().join(", ") %} - {%= playerData.getTeamAbbrev().toUpperCase() %}</span>
	<span class="player-age">Age: {%= playerData.getAge() %}</span>
	<table id="player-card-table">
		<thead>
			<th>Year</th>
			<th>AVG</th>
			<th>HR</th>
			<th>RBI</th>
			<th>SB</th>
			<th>Pts</th>
		</thead>
		<tbody>
			{% for(var i=0;i<3;i++) { %}
				<tr><td>{%= getYear(i) %}</td><td>{%= stats[i].getAVG() %}</td><td>{%= stats[i].getHomeruns() %}</td><td>{%= stats[i].getRBI() %}</td><td>{%= stats[i].getStolenBases() %}</td><td>{%= stats[i].getPoints() %}</td></tr>
			{% } %}
		<tbody>
	</table>
	<span class="asterisk-desc"><sup>*</sup> Based on 2014 projections</span>
	<ul id="news-tabs">
		<li data-id="preview" class="tab selected">2014 Preview</li>
		<li data-id="fantasy" class="tab">Notes</li>
	</ul>
	<div id="preview-notes" class="notes">{%= preview.preview %}{% if(typeof preview.one_liner !== "undefined" && preview.one_liner !== "") { %}</br></br><b>Fantasy Bottom Line:</b> {%= preview.one_liner %}{% } %}</div>
	<div id="fantasy-notes" class="notes"><b>{%= news.display_ts_closer_fmt %}</b> - {%= news.spin %}</div>
</div>