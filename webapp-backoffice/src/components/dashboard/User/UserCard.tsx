import { OnButtonClickUserParams } from '@/src/pages/administration/dashboard/users';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

type Props = {
	user: User;
	onButtonClick: ({ type, user }: OnButtonClickUserParams) => void;
};

const UserCard = ({ user, onButtonClick }: Props) => {
	const { data: session } = useSession({ required: true });
	const isOwn =
		session?.user?.id !== undefined && Number(session.user.id) === user.id;
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
					<Link
						href={`/administration/dashboard/user/${user.id}/${
							isOwn ? 'infos' : 'account'
						}`}
					>
						<p
							className={cx(
								fr.cx('fr-mb-0', 'fr-text--bold'),
								classes.userName
							)}
						>
							{user.firstName + ' ' + user.lastName}
						</p>
					</Link>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<p className={cx(fr.cx('fr-m-0'), classes.userEmail)}>{user.email}</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<span>{formatDateToFrenchString(user.created_at.toString())}</span>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
					<span
						className={cx(fr.cx('fr-mb-0', 'fr-text--bold', 'fr-hidden-md'))}
					>
						Statut:{' '}
					</span>
					{user.role.includes('admin') ? (
						<Badge small severity="info" noIcon>
							Superadmin
						</Badge>
					) : null}
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(UserCard.name).create(() => ({
	userName: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
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
	userEmail: {
		wordWrap: 'break-word',
		textDecoration: 'none'
	}
}));

export default UserCard;
