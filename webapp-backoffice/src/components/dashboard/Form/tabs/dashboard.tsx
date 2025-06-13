import React from 'react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import Link from 'next/link';
import { Loader } from '@/src/components/ui/Loader';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import ObservatoireStats from '../../Stats/ObservatoireStats';

interface Props {
	hasReviews: boolean;
	isLoading: boolean;
	form: FormWithElements;
}

const DashboardTab = ({ hasReviews, isLoading, form }: Props) => {
	const { cx, classes } = useStyles();

	if (isLoading) return <Loader />;

	return hasReviews ? (
		<div className={fr.cx('fr-grid-row')}>
			<h2 className={fr.cx('fr-col-12', 'fr-mb-8v')}>Tableau de bord</h2>
			<div className={fr.cx('fr-col-4')}>
				<ObservatoireStats
					productId={form.product_id}
					startDate={
						new Date(new Date().setFullYear(new Date().getFullYear() - 1))
							.toISOString()
							.split('T')[0]
					}
					endDate={new Date().toISOString().split('T')[0]}
					slugsToDisplay={[
						'satisfaction',
						'comprehension',
						'contactReachability',
						'contactSatisfaction'
					]}
					title="Dernières évolutions"
					view="form-dashboard"
				/>
			</div>
			<div className={fr.cx('fr-col-8')}></div>
		</div>
	) : (
		<div className={cx(classes.mainContainer, fr.cx('fr-container'))}>
			<Image
				src="/assets/chat_picto.svg"
				alt="Picto feuille de route"
				width={120}
				height={120}
			/>
			<div className={classes.container}>
				<span className={classes.smallTitle}>
					Il n’y a aucun avis pour le moment
				</span>
				<p className={fr.cx('fr-mt-3v', 'fr-mb-0')}>
					Vous n’avez pas encore reçu d’avis de la part de vos utilisateurs.
				</p>
				<p className={fr.cx('fr-mb-3v')}>
					En attendant, vous pouvez découvrir nos conseils pour bien placer le
					bouton de récolte d’avis :
				</p>
				<Link href="#" target="_blank">
					Améliorer le placement de votre bouton
				</Link>
			</div>
		</div>
	);
};

const useStyles = tss.withName(DashboardTab.name).create({
	mainContainer: {
		...fr.spacing('padding', {}),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: fr.spacing('6v'),
		maxWidth: '65%',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			maxWidth: '100%'
		}
	},
	container: {
		...fr.spacing('padding', {}),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	smallTitle: {
		fontWeight: 'bold',
		fontSize: '20px',
		lineHeight: '28px'
	}
});

export default DashboardTab;
