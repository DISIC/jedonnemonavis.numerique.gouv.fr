export const FORM_INCLUDE = {
	product: true,
	form_configs: {
		where: {
			status: 'published' as const
		},
		orderBy: {
			created_at: 'desc' as const
		},
		take: 100,
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
							options: {
								orderBy: {
									position: 'asc' as const
								}
							}
						},
						orderBy: {
							position: 'asc' as const
						}
					}
				},
				orderBy: {
					position: 'asc' as const
				}
			},
			form_template_buttons: { include: { variants: true } }
		}
	}
} as const;
