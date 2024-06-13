import { fr } from '@codegouvfr/react-dsfr';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { tss } from 'tss-react/dsfr';

type QuestionWrapperProps = {
	fieldLabel: string;
	totalField: number;
	total: number;
	required?: boolean;
	children: React.ReactNode;
};

const QuestionWrapper = ({
	fieldLabel,
	totalField,
	total,
	required = false,
	children
}: QuestionWrapperProps) => {
	const { classes } = useStyles();

	return (
		<div className={classes.wrapperSection}>
			<h4 className={fr.cx('fr-mt-6v')}>{fieldLabel}</h4>
			<div className={classes.metaInfos}>
				<div className={classes.metaInfosIcon}>
					<span className={fr.cx('ri-question-answer-line', 'fr-icon--lg')} />
				</div>
				<div className={classes.metaInfosTotal}>
					<div>{totalField}</div> <span>Réponses</span>
				</div>
				<div className={fr.cx('fr-hint-text', 'fr-ml-4v', 'fr-mt-0-5v')}>
					taux de réponse : {Math.round((totalField / total) * 100)} %{' '}
					{required && '(question obligatoire)'}
				</div>
			</div>
			<div>{children}</div>
		</div>
	);
};

const useStyles = tss.create({
	wrapperSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('3v'),
		marginTop: fr.spacing('10v')
	},
	metaInfos: {
		display: 'flex',
		alignItems: 'center',
		gap: '1rem'
	},
	metaInfosIcon: {
		borderRadius: '100%',
		padding: '1rem',
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		color: fr.colors.decisions.background.flat.blueFrance.default,
		marginRight: fr.spacing('4v')
	},
	metaInfosTotal: {
		display: 'flex',
		alignItems: 'center',
		...fr.typography[11].style,
		fontSize: '2rem',
		margin: 0,
		span: {
			...fr.typography[19].style,
			margin: `0 0 0 ${fr.spacing('4v')}`
		}
	}
});

export default QuestionWrapper;
