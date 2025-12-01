interface FormWithReviews {
	formId: number;
	formTitle: string;
	reviewCount: number;
}

interface ProductWithReviews {
	title: string;
	id: number;
	nbReviews: number;
	entityName?: string;
	forms?: FormWithReviews[];
}

export interface JdmaNotificationsEmailProps {
	userId?: number;
	frequency?: 'daily' | 'weekly' | 'monthly';
	totalNbReviews?: number;
	startDate?: Date;
	endDate?: Date;
	products?: ProductWithReviews[];
	baseUrl?: string;
}

export interface JdmaClosedButtonOrFormEmailProps {
	userName: string;
	buttonTitle?: string;
	formTitle?: string;
	form: { id: number; title: string };
	product: { id: number; title: string; entityName: string };
	baseUrl?: string;
}

export interface JdmaInviteEmailProps {
	inviterName: string;
	productTitle?: string;
	entityName?: string;
	baseUrl?: string;
}

export interface JdmaOtpEmailProps {
	code: string;
	baseUrl?: string;
}

export interface JdmaProductArchivedEmailProps {
	userName: string;
	productTitle: string;
	baseUrl?: string;
}

export interface JdmaProductRestoredEmailProps {
	userName: string;
	productTitle: string;
	productId: number;
	baseUrl?: string;
}

export interface JdmaTokenEmailProps {
	token: string;
	baseUrl?: string;
}
export interface JdmaUserInviteEmailProps {
	inviterName: string;
	recipientEmail: string;
	inviteToken: string;
	productTitle?: string;
	entityName?: string;
	baseUrl?: string;
}

export interface JdmaUserRequestRefusedEmailProps {
	message?: string;
	baseUrl?: string;
}
