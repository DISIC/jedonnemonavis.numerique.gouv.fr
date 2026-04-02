import { fr } from '@codegouvfr/react-dsfr';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { tss } from 'tss-react/dsfr';

interface Props {
	onClick: (sort: string) => void;
	sort: string;
	form: FormWithElements;
}

const ReviewTableHeader = (props: Props) => {
	const { onClick, form } = props;

	const { cx, classes } = useStyles({});

	const mainBlocks = form.form_template.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.filter(block => block.isMainBlock);

	const hasVerbatimBlock = form.form_template.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.some(block => block.field_code === 'verbatim');

	const sortList = [
		{
			label: 'Date',
			code: 'created_at'
		},
		...mainBlocks.map(block => ({
			label: block.alias ? block.alias : block.label ?? '',
			code: block.type_bloc || ''
		})),
		...(hasVerbatimBlock
			? [
					{
						label: 'Commentaire',
						code: 'verbatim'
					}
			  ]
			: [])
	];

	return (
		<thead className={cx(classes.lineContainer)}>
			<tr
				className={cx(
					classes.trContainer,
					fr.cx('fr-hidden', 'fr-unhidden-lg')
				)}
			>
				{sortList.map((sort, index) => (
					<th
						className={cx(
							classes.badgeVerbatim,
							sort.code ? classes.pointer : '',
							fr.cx('fr-hidden', 'fr-unhidden-lg'),
							classes.thContainer
						)}
						key={index}
						onClick={() => {
							if (sort.code) {
								onClick(sort.code);
							}
						}}
						scope="col"
					>
						<span>
							{sort.label}{' '}
							{props.sort.includes(sort.code || sort.label) && (
								<i
									className={cx(
										props.sort.includes('asc')
											? 'ri-arrow-drop-down-fill'
											: 'ri-arrow-drop-up-fill',
										classes.thIcon
									)}
								></i>
							)}
						</span>
					</th>
				))}
				{new Array(2).fill(0).map((i, index) => (
					<th
						className={cx(classes.badgeVerbatim)}
						key={`fake_div_${index}`}
						aria-hidden="true"
					></th>
				))}
				<th
					className={cx(
						classes.badgeVerbatim,
						classes.thContainer,
						fr.cx('fr-pr-8v')
					)}
					scope="col"
				>
					Action
				</th>
			</tr>
		</thead>
	);
};

const useStyles = tss.create({
	lineContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		padding: 12,
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderRadius: 0,
		[fr.breakpoints.down('lg')]: {
			border: 'none'
		}
	},
	trContainer: {
		width: '100%',
		display: 'flex',
		'th:last-of-type': {
			textAlign: 'right'
		}
	},
	thContainer: {
		width: 'max-content',
		lineHeight: 1,
		span: {
			position: 'relative'
		},
		[fr.breakpoints.down('lg')]: {
			display: 'none'
		}
	},
	thIcon: {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		fontSize: 12
	},
	pointer: {
		cursor: 'pointer'
	},
	badge: {
		display: 'block',
		fontSize: 14,
		flex: '1 1 10%',
		[fr.breakpoints.down('lg')]: {
			flex: '50%',
			marginTop: 12
		},
		['&:nth-of-type(2), &:nth-of-type(3)']: {
			flex: '1 1 8%'
		},
		['&:nth-of-type(9)']: {
			flex: '1 1 14%'
		}
	},
	badgeVerbatim: {
		display: 'block',
		width: 'fit-content',
		minWidth: 120,
		paddingVertical: 4,
		fontSize: 14,
		flex: '0 0 calc(100% / 6);'
	}
});

export default ReviewTableHeader;
