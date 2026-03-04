import { TypeAction } from '@prisma/client';

export const SERVICE_ACTIONS: TypeAction[] = [
	TypeAction.service_create,
	TypeAction.service_update,
	TypeAction.service_archive,
	TypeAction.service_restore
];

export const PRODUCT_ACTIONS: TypeAction[] = [
	TypeAction.service_invite,
	TypeAction.service_uninvite,
	TypeAction.service_button_create,
	TypeAction.service_button_update,
	TypeAction.service_button_delete,
	TypeAction.service_apikeys_create,
	TypeAction.service_apikeys_delete,
	TypeAction.form_config_create,
	TypeAction.service_form_create,
	TypeAction.service_form_edit,
	TypeAction.service_form_delete
];

export const ORGANISATION_ACTIONS: TypeAction[] = [
	TypeAction.organisation_update,
	TypeAction.organisation_invite,
	TypeAction.organisation_uninvite
];

export const ALL_ACTIONS: TypeAction[] = [
	...SERVICE_ACTIONS,
	...PRODUCT_ACTIONS,
	...ORGANISATION_ACTIONS
];
