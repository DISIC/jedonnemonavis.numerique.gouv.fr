import { UserRequestExtended } from '@/src/pages/administration/dashboard/user-requests';
import { OnButtonClickUserParams } from '@/src/pages/administration/dashboard/users';
import { UserRequestWithUser } from '@/src/types/prismaTypesExtended';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';

type Props = {
	userRequest: UserRequestWithUser;
	setCurrentUserRequest: (user_request: UserRequestExtended) => void;
};

const UserRequestCard = ({ userRequest, setCurrentUserRequest }: Props) => {
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
						{userRequest.user.firstName + ' ' + userRequest.user.lastName}
					</p>
					<span>{userRequest.user.email}</span>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<span>
						{formatDateToFrenchString(userRequest.created_at.toString())}
					</span>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<p className={fr.cx('fr-mb-0')}>{userRequest.reason}</p>
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3'),
						classes.wrapperButtons
					)}
				>
					<Button
						priority="tertiary"
						iconId="fr-icon-close-line"
						iconPosition="right"
						className={cx(fr.cx('fr-mr-5v'), classes.iconError)}
						onClick={() =>
							setCurrentUserRequest({
								...userRequest,
								type: 'delete-on-confirm'
							})
						}
					>
						Rejeter
					</Button>
					<Button
						priority="secondary"
						iconId="fr-icon-check-line"
						iconPosition="right"
						className={cx(fr.cx('fr-mr-5v'))}
						onClick={() =>
							setCurrentUserRequest({
								...userRequest,
								type: 'accept-on-confirm'
							})
						}
					>
						Accepter
					</Button>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(UserRequestCard.name).create(() => ({
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

export default UserRequestCard;
