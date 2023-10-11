import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import type { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { tss } from 'tss-react/dsfr';
import { useSession } from 'next-auth/react';

interface Props {
	accessRight: AccessRightWithUsers;
	onButtonClick: (
		modalType: 'remove' | 'resend-email',
		accessRight?: AccessRightWithUsers
	) => void;
}

const ProductAccessCard = (props: Props) => {
	const { accessRight, onButtonClick } = props;
	const { data: session } = useSession({ required: true });
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const { cx, classes } = useStyles();

	return (
		<>
			<div
				className={cx(
					fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w'),
					accessRight.status === 'removed' ? classes.cardStatusRemoved : ''
				)}
			>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
						<span className={fr.cx('fr-text--bold')}>
							{accessRight.user
								? `${accessRight.user?.firstName} ${accessRight.user?.lastName}`
								: '-'}
						</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<span className={cx(classes.userEmail)}>
							{accessRight?.user_email
								? accessRight?.user_email
								: accessRight?.user_email_invite}
						</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Badge
							noIcon
							severity={
								accessRight.user !== null && accessRight.status === 'carrier'
									? 'success'
									: 'info'
							}
							className={cx(
								classes.badge,
								accessRight.status === 'removed'
									? classes.badgeStatusRemoved
									: ''
							)}
						>
							{accessRight.user === null
								? 'Invité'
								: accessRight.status === 'carrier'
								? 'Porteur'
								: 'Retiré'}
						</Badge>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Button
							id="button-options-access-right"
							aria-controls={menuOpen ? 'option-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={menuOpen ? 'true' : undefined}
							priority="tertiary"
							className={menuOpen ? classes.buttonOptionsOpen : ''}
							onClick={handleClick}
							disabled={
								accessRight.status === 'removed' ||
								accessRight.user_email === session?.user?.email
							}
							iconId={menuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
							iconPosition="right"
							size="small"
						>
							Options
						</Button>
						<Menu
							id="option-menu"
							open={menuOpen}
							anchorEl={anchorEl}
							onClose={handleClose}
							MenuListProps={{
								'aria-labelledby': 'button-options-access-right'
							}}
						>
							{accessRight.user === null && (
								<MenuItem
									onClick={() => {
										onButtonClick('resend-email', accessRight);
										handleClose();
									}}
								>
									Renvoyer l'e-mail d'invitation
								</MenuItem>
							)}
							<MenuItem
								onClick={() => {
									onButtonClick('remove', accessRight);
									handleClose();
								}}
							>
								Retirer son droit d'accès
							</MenuItem>
						</Menu>
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.create({
	cardStatusRemoved: {
		backgroundColor: fr.colors.decisions.background.disabled.grey.default
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
	buttonOptionsOpen: {
		backgroundColor: fr.colors.decisions.background.actionLow.blueFrance.default
	},
	userEmail: {
		wordWrap: 'break-word'
	}
});

export default ProductAccessCard;
