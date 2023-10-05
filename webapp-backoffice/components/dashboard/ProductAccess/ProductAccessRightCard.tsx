import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { UserProductUserWithUsers } from '@/pages/api/prisma/userProduct/type';
import { tss } from 'tss-react/dsfr';
import { useSession } from 'next-auth/react';

interface Props {
	userProduct: UserProductUserWithUsers;
	onButtonClick: (
		modalType: 'remove' | 'resend-email',
		userProduct?: UserProductUserWithUsers
	) => void;
}

const ProductAccessCard = (props: Props) => {
	const { userProduct, onButtonClick } = props;
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
					userProduct.status === 'removed' ? classes.cardStatusRemoved : ''
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
							{userProduct.user
								? `${userProduct.user?.firstName} ${userProduct.user?.lastName}`
								: '-'}
						</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<span>{userProduct.user_email}</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Badge
							noIcon
							severity={
								userProduct.user !== null && userProduct.status === 'carrier'
									? 'success'
									: 'info'
							}
							className={cx(
								classes.badge,
								userProduct.status === 'removed'
									? classes.badgeStatusRemoved
									: ''
							)}
						>
							{userProduct.user === null
								? 'Invité'
								: userProduct.status === 'carrier'
								? 'Porteur'
								: 'Retiré'}
						</Badge>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Button
							id="button-options"
							aria-controls={menuOpen ? 'option-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={menuOpen ? 'true' : undefined}
							priority="tertiary"
							className={menuOpen ? classes.buttonOptionsOpen : ''}
							onClick={handleClick}
							disabled={
								userProduct.status === 'removed' ||
								userProduct.user_email === session?.user?.email
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
								'aria-labelledby': 'button-options'
							}}
						>
							{userProduct.user === null && (
								<MenuItem onClick={() => onButtonClick('resend-email')}>
									Renvoyer l'e-mail d'invitation
								</MenuItem>
							)}
							<MenuItem onClick={() => onButtonClick('remove', userProduct)}>
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
	}
});

export default ProductAccessCard;
