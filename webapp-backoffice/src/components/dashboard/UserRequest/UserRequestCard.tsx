import { UserRequestExtended } from '@/src/pages/administration/dashboard/user-requests';
import { UserRequestWithUser } from '@/src/types/prismaTypesExtended';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
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
					'fr-grid-row--top'
				)}
			>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					{userRequest.user !== null ? (
						<>
							<p className={cx(fr.cx('fr-mb-0'), classes.spanFullName)}>
								{`${userRequest?.user?.firstName} ${userRequest?.user?.lastName}`}
							</p>
							<span>{userRequest?.user?.email}</span>
						</>
					) : (
						<span>{userRequest.user_email_copy}</span>
					)}
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
					<span>
						{formatDateToFrenchString(userRequest.created_at.toString())}
					</span>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
					<p className={fr.cx('fr-mb-0')}>{userRequest.reason}</p>
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3'),
						classes.wrapperButtons
					)}
				>
					{userRequest.status === 'pending' ? (
						<>
							<Button
								priority="tertiary"
								size="small"
								iconId="fr-icon-close-line"
								iconPosition="right"
								className={cx(fr.cx('fr-mr-5v'), classes.iconError)}
								onClick={() =>
									setCurrentUserRequest({
										...userRequest,
										type: 'refused-on-confirm'
									})
								}
							>
								Rejeter
							</Button>
							<Button
								priority="secondary"
								size="small"
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
						</>
					) : (
						<>
							<Badge
								noIcon
								severity={
									userRequest.status === 'accepted' ? 'success' : 'info'
								}
								className={cx(
									classes.badge,
									userRequest.status === 'refused'
										? classes.badgeStatusRemoved
										: ''
								)}
							>
								{userRequest.status === 'accepted' ? 'Acceptée' : 'Refusée'}
							</Badge>
						</>
					)}
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
	badge: {
		display: 'block',
		width: '7.5rem',
		textAlign: 'center'
	},
	badgeStatusRemoved: {
		color: fr.colors.decisions.background.flat.purpleGlycine.default,
		backgroundColor:
			fr.colors.decisions.background.contrast.purpleGlycine.default
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
