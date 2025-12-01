import axe = require('axe-core');

export function displayViolationsTable(
	violations: axe.Result[],
	withDetails = false,
	detailId?: string
) {
	cy.task(
		'log',
		`${violations.length} accessibility violation${
			violations.length === 1 ? '' : 's'
		} ${violations.length === 1 ? 'was' : 'were'} detected`
	);
	// pluck specific keys to keep the table readable
	const violationData = violations.map(
		({ id, impact, description, nodes }) => ({
			id,
			impact,
			description,
			nodes: nodes.length // nodes.map(n => n.html)
		})
	);

	cy.task('table', violationData);
	violations.forEach(v => cy.task('log', v.helpUrl));
	cy.task('log', '---\n');

	if (withDetails) {
		const violationsToShow = detailId
			? violations.filter(v => v.id === detailId)
			: violations;

		violationsToShow.forEach(v => {
			cy.task('log', `Violation: ${v.id} (${v.impact})`);
			cy.task('log', `Description: ${v.description}`);
			cy.task('log', 'Nodes:');
			v.nodes.forEach((n, index) => {
				cy.task('log', `  Node ${index + 1}:`);
				cy.task('log', `    HTML: ${n.html}`);
				cy.task('log', `    Target: ${n.target.join(', ')}`);
				cy.task('log', `\n`);
			});
			if (v.nodes[0]?.failureSummary) {
				cy.task('log', `    Failure Summary: ${v.nodes[0].failureSummary}`);
			}
			cy.task('log', '\n---\n');
		});
	}

	if (!withDetails) cy.task('log', '---\n');
}
