import { OnButtonClickUserParams } from '@/src/pages/administration/dashboard/users';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { tss } from 'tss-react/dsfr';

type Props = {
	user: User;
	onButtonClick: ({ type, user }: OnButtonClickUserParams) => void;
};

const UserCard = ({ user, onButtonClick }: Props) => {
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
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<p className={cx(fr.cx('fr-mb-0'), classes.spanFullName)}>
						{user.firstName + ' ' + user.lastName}
					</p>
					<span>{user.email}</span>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<span>{formatDateToFrenchString(user.created_at.toString())}</span>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
					{user.observatoire_account ? (
						<i
							className={cx(
								fr.cx('fr-icon-checkbox-circle-line'),
								classes.iconSuccess
							)}
						/>
					) : (
						<i
							className={cx(
								fr.cx('fr-icon-close-circle-line'),
								classes.iconError
							)}
						/>
					)}
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.wrapperButtons
					)}
				>
					<Button
						priority="tertiary"
						iconId="fr-icon-delete-bin-line"
						disabled={session?.user.email === user.email}
						iconPosition="right"
						className={cx(fr.cx('fr-mr-5v'), classes.iconError)}
						onClick={() => onButtonClick({ type: 'delete', user })}
					>
						Supprimer
					</Button>
					<Button
						priority="secondary"
						iconId="fr-icon-edit-line"
						iconPosition="right"
						onClick={() => onButtonClick({ type: 'create', user })}
					>
						Modifier
					</Button>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(UserCard.name).create(() => ({
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
	}
}));

export default UserCard;
