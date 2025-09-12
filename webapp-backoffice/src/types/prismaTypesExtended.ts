import { Prisma } from '@prisma/client';

const AccessRightWithUsers = Prisma.validator<Prisma.AccessRightDefaultArgs>()({
	include: {
		user: true
	}
});

export type AccessRightWithUsers = Prisma.AccessRightGetPayload<
	typeof AccessRightWithUsers
>;

const AdminEntityRightWithUsers =
	Prisma.validator<Prisma.AdminEntityRightDefaultArgs>()({
		include: {
			user: true
		}
	});

export type AdminEntityRightWithUsers = Prisma.AdminEntityRightGetPayload<
	typeof AdminEntityRightWithUsers
>;

const ProductWithForms = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: {
		forms: {
			include: {
				form_template: true,
				form_configs: {
					include: {
						form_config_displays: true,
						form_config_labels: true
					}
				},
				buttons: { include: { closedButtonLog: true } }
			}
		}
	}
});

export type ProductWithForms = Prisma.ProductGetPayload<
	typeof ProductWithForms
>;

const ButtonWithForm = Prisma.validator<Prisma.ButtonDefaultArgs>()({
	include: {
		form: true
	}
});

export type ButtonWithForm = Prisma.ButtonGetPayload<typeof ButtonWithForm>;

const ButtonWithClosedLog = Prisma.validator<Prisma.ButtonDefaultArgs>()({
	include: {
		closedButtonLog: true
	}
});

export type ButtonWithClosedLog = Prisma.ButtonGetPayload<
	typeof ButtonWithClosedLog
>;

const UserWithEntities = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		entities: true
	}
});

export type UserWithEntities = Prisma.UserGetPayload<typeof UserWithEntities>;

const UserRequestWithUser = Prisma.validator<Prisma.UserRequestDefaultArgs>()({
	include: {
		user: true
	}
});

export type UserRequestWithUser = Prisma.UserRequestGetPayload<
	typeof UserRequestWithUser
>;

const UserWithAccessRight = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		accessRights: true
	}
});

export type UserWithAccessRight = Prisma.UserGetPayload<
	typeof UserWithAccessRight
>;

const FormWithElements = Prisma.validator<Prisma.FormDefaultArgs>()({
	include: {
		product: true,
		form_configs: {
			include: {
				form_config_displays: true,
				form_config_labels: true
			}
		},
		form_template: {
			include: {
				form_template_steps: {
					include: {
						form_template_blocks: {
							include: {
								options: true
							}
						}
					}
				}
			}
		}
	}
});

export type FormWithElements = Prisma.FormGetPayload<typeof FormWithElements>;

const FormTemplateWithElements =
	Prisma.validator<Prisma.FormTemplateDefaultArgs>()({
		include: {
			form_template_steps: {
				include: {
					form_template_blocks: {
						include: {
							options: true
						}
					}
				}
			}
		}
	});

export type FormTemplateWithElements = Prisma.FormTemplateGetPayload<
	typeof FormTemplateWithElements
>;

const FormConfigWithChildren = Prisma.validator<Prisma.FormConfigDefaultArgs>()(
	{
		include: {
			form_config_displays: true,
			form_config_labels: true
		}
	}
);

export type FormConfigWithChildren = Prisma.FormConfigGetPayload<
	typeof FormConfigWithChildren
>;
