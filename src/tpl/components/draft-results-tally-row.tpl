{%
	var ownerData = this.manager;
	var tally = this.tally;
%}
<tr class="empty">
	<td>{%= (ownerData.getName().length > 7) ? ownerData.getName().substr(0, 7)+"..." : ownerData.getName() %}</td>
	<td>{%= tally["c"] %}</td>
	<td>{%= tally["1b"] %}</td>
	<td>{%= tally["2b"] %}</td>
	<td>{%= tally["ss"] %}</td>
	<td>{%= tally["3b"] %}</td>
	<td>{%= tally["of"] %}</td>
	<td>{%= tally["u"] %}</td>
	<td>{%= tally["p"] %}</td>
</tr>