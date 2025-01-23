import { Menu, MenuItem } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import type { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { AccessRightModalType } from '@/src/pages/administration/dashboard/product/[id]/access';
import { RightAccessStatus } from '@prisma/client';

interface MenuOptionProps {
	open: boolean;
	anchorEl: HTMLElement | null;
	onClose: () => void;
	accessRight: AccessRightWithUsers;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	onButtonClick: (
		modalType: AccessRightModalType,
		accessRight?: AccessRightWithUsers
	) => void;
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

const MENU_ITEMS_BY_STATUS = {
	carrier_admin: ['REMOVE', 'SWITCH_TO_USER', 'RESEND'],
	carrier_user: ['REMOVE', 'SWITCH_TO_ADMIN', 'RESEND']
} as const;

export const AccessRightMenuOptions = ({
	open,
	anchorEl,
	onClose,
	accessRight,
	ownRight,
	onButtonClick
}: MenuOptionProps) => {
	if (ownRight !== 'carrier_admin') return null;

	const handleMenuAction = (
		action: AccessRightModalType,
		eventName: string
	) => {
		onButtonClick(action, accessRight);
		push(['trackEvent', 'BO - Product - Access Rights', eventName]);
		onClose();
	};

	const menuItems =
		MENU_ITEMS_BY_STATUS[
			accessRight.status as keyof typeof MENU_ITEMS_BY_STATUS
		] || [];

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
			{menuItems.map(itemKey => {
				const item = MENU_ITEMS[itemKey];
				if (itemKey === 'RESEND' && accessRight.user_email_invite === null) {
					return null;
				}
				return (
					<MenuItem
						key={item.action}
						style={{ color: '#000091' }}
						onClick={() =>
							handleMenuAction(item.action as AccessRightModalType, item.event)
						}
					>
						{item.label}
					</MenuItem>
				);
			})}
		</Menu>
	);
};
