import { OnButtonClickEntityParams } from '@/src/pages/administration/dashboard/entities';
import type { EntityWithUsersAndProducts } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useSession } from 'next-auth/react';
import { tss } from 'tss-react/dsfr';

type Props = {
	entity: EntityWithUsersAndProducts;
	onButtonClick: ({ type, entity }: OnButtonClickEntityParams) => void;
};

const EntityCard = ({ entity, onButtonClick }: Props) => {
	const { data: session } = useSession({ required: true });
	const { cx, classes } = useStyles();

	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--middle'
				)}
			>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
					<p className={cx(fr.cx('fr-mb-0'), classes.spanFullName)}>
						{entity.name}
					</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
					{entity.users.length}
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
					{entity.products.length}
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3'),
						classes.wrapperButtons
					)}
				>
					<Button
						priority="tertiary"
						size="small"
						iconId="fr-icon-delete-bin-line"
						iconPosition="right"
						className={cx(fr.cx('fr-mr-5v'), classes.iconError)}
						onClick={() => onButtonClick({ type: 'delete', entity })}
					>
						Supprimer
					</Button>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(EntityCard.name).create(() => ({
	spanFullName: {
		fontWeight: 'bold'
	},
	iconSuccess: {
		color: 'green'
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	},
	wrapperButtons: {
		display: 'flex',
		justifyContent: 'end'
	},
	entityEmail: {
		wordWrap: 'break-word'
	}
}));

export default EntityCard;
