import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';

const Maintenance = () => {
	const { cx, classes } = useStyles();
	return (
		<div className={classes.container}>
			<Image src={'/assets/community.png'} alt="" width={120} height={120} />
			<h1 className={fr.cx('fr-mt-4v')}>
				Maintenance de la plateforme en cours
			</h1>
			<p className={fr.cx('fr-hint-text')}>
				Veuillez patienter quelques instants, nos équipes sont sur le pont.
			</p>
		</div>
	);
};

const useStyles = tss.withName(Maintenance.name).create(() => ({
	container: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh'
	}
}));

export default Maintenance;
