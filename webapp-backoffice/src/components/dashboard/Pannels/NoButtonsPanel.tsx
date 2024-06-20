import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	onButtonClick: () => void;
	isSmall?: boolean;
}
const NoButtonsPanel = (props: Props) => {
	const { onButtonClick, isSmall } = props;
	const { cx, classes } = useStyles();

	const getTitle = () => {
		return isSmall ? (
			<div className={cx(classes.title)}>Obtenez vos premiers avis</div>
		) : (
			<h3>Obtenez vos premiers avis</h3>
		);
	};

	return (
		<div className={cx(classes.container, fr.cx('fr-container'))}>
			{getTitle()}
			<Button
				priority="primary"
				iconId="fr-icon-add-circle-line"
				iconPosition="right"
				type="button"
				size={isSmall ? 'small' : 'medium'}
				nativeButtonProps={{
					onClick: event => {
						event.preventDefault();
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
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	title: {
		fontWeight: 'bold',
		fontSize: '16px',
		paddingBottom: '1.5rem'
	}
});

export default NoButtonsPanel;
