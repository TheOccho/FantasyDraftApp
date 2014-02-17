{%
%}
<ul id="position-filter">
	<li data-id="all" class="tab first-child selected">All Hitters</li>
	<li data-id="c" class="tab">C</li>
	<li data-id="1b" class="tab">1B</li>
	<li data-id="2b" class="tab">2B</li>
	<li data-id="ss" class="tab">SS</li>
	<li data-id="3b" class="tab">3B</li>
	<li data-id="of" class="tab">OF</li>
	<li data-id="p" class="tab">P</li>
	<li data-id="search" class="tab last-child">Search</li>
</ul>
<div id="ranking-stat-filters">
	<div id="ranking"><span class="label">Ranking:</span> <span id="custom-ranking" class="filter" data-id="custom">Custom</span> | <span id="default-ranking" class="filter selected" data-id="default">Default</span></div>
	<div id="stats"><span class="label">Stats:</span> <span id="projected-stats" class="filter selected" data-id="proj">Projected</span> | <span id="last-season-stats" class="filter" data-id="last">Last Season</span></div>
	<div class="hide-drafted"><input type="checkbox" checked="" />Hide Drafted</div>
</div>
<div id="search-filter">
	<span>Search Players By Name</span>
	<input id="search-input" type="text" placeholder="Enter player name"></input>
	<div class="hide-drafted"><input type="checkbox" checked="" />Hide Drafted</div>
</div>
<table cellpadding="0" cellspacing="0" border="0" class="display" id="player-grid-table"></table>