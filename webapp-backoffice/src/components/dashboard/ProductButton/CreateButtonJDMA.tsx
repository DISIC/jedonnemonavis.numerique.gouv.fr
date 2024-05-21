import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	onButtonClick: () => void;
}
const CreateButtonJDMA = (props: Props) => {
	const { onButtonClick } = props;
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.container, fr.cx('fr-container'))}>
			<h3>Obtenez vos premiers avis</h3>
			<Button
				priority="primary"
				iconId="fr-icon-add-circle-line"
				iconPosition="right"
				type="button"
				size="medium"
				nativeButtonProps={{
					onClick: () => {
						onButtonClick();
					}
				}}
			>
				Créer un bouton JDMA
			</Button>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', {}),
		padding: '2rem',
		background: '#F3F6FE',
		marginTop: '3rem',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	}
});

export default CreateButtonJDMA;
