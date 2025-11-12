import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Form } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';

interface Props {
	form: Form;
}

type ContentType = {
	iconId: FrIconClassName | RiIconClassName;
	text: string;
	link?: { href: string; label: string };
};

export const buttonContents: readonly ContentType[] = [
	{
		iconId: 'ri-cursor-line',
		text: 'Un bouton JDMA permet à vos utilisateurs d’accéder au formulaire.'
	},
	{
		iconId: 'ri-code-box-line',
		text: "Chaque lien d'intégration génère une petite portion de code à coller à l’endroit où vous souhaitez faire apparaitre le bouton JDMA"
	},
	{
		iconId: 'ri-line-chart-line',
		text: "Vous pouvez créer plusieurs liens d'intégration de bouton JDMA pour chaque formulaire.",
		link: {
			href: 'https://designgouv.notion.site/Pourquoi-cr-er-plusieurs-emplacements-21515cb98241806fa1a4f9251f3ebce7',
			label: 'En savoir plus sur les liens multiples'
		}
	}
] as const;

const ServiceFormsNoButtonsPanel = (props: Props) => {
	const router = useRouter();
	const { form } = props;
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.container, fr.cx('fr-container', 'fr-p-6v'))}>
			<div className={fr.cx('fr-col-12', 'fr-mb-6v')}>
				<span className={classes.title}>
					Définissez les liens d'intégration de vos boutons JDMA (Je Donne Mon
					Avis)
				</span>
			</div>
			{buttonContents.map((content, index) => (
				<div
					key={index}
					className={cx(classes.content, fr.cx('fr-col-12', 'fr-py-0'))}
				>
					<div className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-md-6v')))}>
						<i className={cx(fr.cx(content.iconId), classes.icon)} />
					</div>
					<div>
						<p>{content.text}</p>
						{content.link && (
							<a href={content.link.href} target="_blank" className="fr-col-12">
								{content.link.label}
							</a>
						)}
					</div>
				</div>
			))}
			<Button
				className={cx(classes.button, fr.cx('fr-mt-8v'))}
				priority="primary"
				iconId="fr-icon-add-line"
				iconPosition="right"
				type="button"
				nativeButtonProps={{
					onClick: event => {
						event.preventDefault();
						push(['trackEvent', 'BO - EmptyState', `Create-button`]);
						router.push(
							`/administration/dashboard/product/${form.product_id}/forms/${form.id}/new-link`
						);
					}
				}}
			>
				Créer un lien d'intégration
			</Button>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', {}),
		background: 'white',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	title: {
		fontWeight: 'bold',
		fontSize: '1.25rem',
		lineHeight: '1.75rem'
	},
	content: {
		display: 'flex',
		alignItems: 'center',

		marginBottom: fr.spacing('6v'),
		'&:last-of-type': {
			marginBottom: 0
		},
		p: {
			margin: 0,
			whiteSpace: 'pre-wrap'
		},
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			marginBottom: fr.spacing('6v')
		}
	},
	indicatorIcon: {
		minWidth: fr.spacing('12v'),
		minHeight: fr.spacing('12v'),
		flexShrink: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': fr.spacing('7v')
		}
	},
	button: {
		alignSelf: 'center'
	}
});

export default ServiceFormsNoButtonsPanel;
