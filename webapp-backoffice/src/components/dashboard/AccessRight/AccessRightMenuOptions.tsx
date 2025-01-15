import { Menu, MenuItem } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import type { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { AccessRightModalType } from '@/src/pages/administration/dashboard/product/[id]/access';

interface MenuOptionProps {
	open: boolean;
	anchorEl: HTMLElement | null;
	onClose: () => void;
	accessRight: AccessRightWithUsers;
	ownRight: 'admin' | 'viewer';
	onButtonClick: (
		modalType: AccessRightModalType,
		accessRight?: AccessRightWithUsers
	) => void;
	userEmail?: string | null;
}

const MENU_ITEMS = {
	REMOVE: {
		label: "Retirer l'accès",
		action: 'remove',
		event: 'Access-rights-Remove'
	},
	SWITCH_TO_USER: {
		label: 'Passer en utilisateur du service',
		action: 'switch',
		event: 'Access-rights-Switch'
	},
	SWITCH_TO_ADMIN: {
		label: 'Passer en administrateur du service',
		action: 'switch',
		event: 'Access-rights-Switch'
	},
	RESEND: {
		label: "Renvoyer l'invitation",
		action: 'resend-email',
		event: 'Access-rights-Resend'
	}
} as const;

export const AccessRightMenuOptions = ({
	open,
	anchorEl,
	onClose,
	accessRight,
	ownRight,
	onButtonClick,
	userEmail
}: MenuOptionProps) => {
	const handleMenuAction = (
		action: AccessRightModalType,
		eventName: string
	) => {
		onButtonClick(action, accessRight);
		push(['trackEvent', 'BO - Product - Access Rights', eventName]);
		onClose();
	};

	const renderMenuItem = (
		item: (typeof MENU_ITEMS)[keyof typeof MENU_ITEMS]
	) => (
		<MenuItem
			style={{ color: '#000091' }}
			onClick={() =>
				handleMenuAction(item.action as AccessRightModalType, item.event)
			}
			disabled={accessRight.user_email === userEmail}
		>
			{item.label}
		</MenuItem>
	);

	if (ownRight !== 'admin') return null;

	return (
		<Menu
			id="option-menu"
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			MenuListProps={{
				'aria-labelledby': 'button-options-access-right'
			}}
		>
			{(() => {
				switch (accessRight.status) {
					case 'carrier_admin':
						return (
							<>
								{renderMenuItem(MENU_ITEMS.REMOVE)}
								{renderMenuItem(MENU_ITEMS.SWITCH_TO_USER)}
								{accessRight.user_email_invite !== null &&
									renderMenuItem(MENU_ITEMS.RESEND)}
							</>
						);
					case 'carrier_user':
						return (
							<>
								{renderMenuItem(MENU_ITEMS.REMOVE)}
								{renderMenuItem(MENU_ITEMS.SWITCH_TO_ADMIN)}
								{accessRight.user_email_invite !== null &&
									renderMenuItem(MENU_ITEMS.RESEND)}
							</>
						);

					default:
						return null;
				}
			})()}
		</Menu>
	);
};
