{%
	var leagueName = this.leagueName;
	var managers = this.managers;
%}
<span class="title">{%= leagueName %} DRAFT ORDER</span>
<table id="draft-order-table">
	<thead>
		<th>Pick</th>
		<th>Team Name</th>
	</thead>
	<tbody>
		{% for(var i=0,l=managers.length;i<l;i++) { %}
			<tr><td>{%= i+1 %}</td><td>{%= managers[i].getName() %}</td></tr>
		{% } %}
	<tbody>
</table>