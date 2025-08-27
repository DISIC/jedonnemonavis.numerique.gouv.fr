export function displayViolationsTable(violations) {
	cy.task(
		'log',
		`${violations.length} accessibility violation${
			violations.length === 1 ? '' : 's'
		} ${violations.length === 1 ? 'was' : 'were'} detected`
	);
	// pluck specific keys to keep the table readable
	const violationData = violations.map(
		({ id, impact, description, nodes, helpUrl }) => ({
			id,
			impact,
			description,
			nodes: nodes.length // nodes.map(n => n.html)
		})
	);

	cy.task('table', violationData);
	violations.forEach(v => cy.task('log', v.helpUrl));
}
