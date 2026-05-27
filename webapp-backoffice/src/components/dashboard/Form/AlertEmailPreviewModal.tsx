import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	isOpen: boolean;
	productTitle?: string;
	formTitle?: string;
}

const AlertEmailPreviewModal = ({
	modal,
	isOpen,
	productTitle,
	formTitle
}: Props) => {
	const { classes } = useStyles();

	const previewQuery = trpc.formAlert.getAlertEmailPreview.useQuery(
		{ productTitle, formTitle },
		{
			enabled: isOpen,
			staleTime: Infinity
		}
	);

	const html = (previewQuery.data?.data.html ?? '').replace(
		/<head([^>]*)>/i,
		`<head$1>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<style>
				body { margin: 0; }
				img { max-width: 100% !important; height: auto !important; }
				[style*="max-width: 640px"], [style*="max-width:640px"] {
					max-width: 100% !important;
				}
			</style>`
	);

	return (
		<modal.Component
			title="Exemple d'un e-mail d'alerte"
			size="large"
			className={fr.cx('fr-my-0')}
		>
			<div className={classes.frame}>
				{previewQuery.isLoading ? (
					<p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
						Chargement de l’aperçu…
					</p>
				) : (
					<iframe
						title="Aperçu de l’e-mail d’alerte"
						srcDoc={html}
						sandbox=""
						className={classes.iframe}
					/>
				)}
			</div>
		</modal.Component>
	);
};

const useStyles = tss.withName({ AlertEmailPreviewModal }).create({
	frame: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderRadius: fr.spacing('1v'),
		overflow: 'hidden',
		background: '#ffffff'
	},
	iframe: {
		width: '100%',
		height: '70vh',
		border: 'none',
		display: 'block',
		[fr.breakpoints.down('md')]: {
			height: '60vh'
		}
	}
});

export default AlertEmailPreviewModal;
