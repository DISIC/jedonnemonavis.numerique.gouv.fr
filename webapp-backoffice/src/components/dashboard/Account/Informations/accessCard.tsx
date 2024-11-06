import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRouter } from 'next/router';

interface Props {
	title: string;
	date?: string;
	modifiable: Boolean;
}

const AccessCard = (props: Props) => {
	const { title, date, modifiable } = props;
	const { cx, classes } = useStyles();
	const router = useRouter();

	return (
		<>
			<div className={cx(fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w'))}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				></div>
			</div>
		</>
	);
};

const useStyles = tss.withName(AccessCard.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default AccessCard;
