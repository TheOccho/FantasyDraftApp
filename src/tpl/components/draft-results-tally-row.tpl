{%
	var manager = this.manager;
	var tally = this.tally;
%}
<tr class="empty">
	<td>{%= manager.getName().substr(0, 12)+"..." %}</td>
	<td>{%= tally["c"] %}</td>
	<td>{%= tally["1b"] %}</td>
	<td>{%= tally["2b"] %}</td>
	<td>{%= tally["ss"] %}</td>
	<td>{%= tally["3b"] %}</td>
	<td>{%= tally["of"] %}</td>
	<td>{%= tally["u"] %}</td>
	<td>{%= tally["p"] %}</td>
</tr>