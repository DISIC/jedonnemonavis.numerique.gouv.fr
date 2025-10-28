import { render } from '@react-email/components';
import JdmaUserRequestAcceptedEmail from '@/react-email/emails/jdma-user-request-accepted-email';
import JdmaUserRequestRefusedEmail from '@/react-email/emails/jdma-user-request-refused-email';
import JdmaOtpEmail from '@/react-email/emails/jdma-otp-email';
import JdmaRegisterEmail from '@/react-email/emails/jdma-register-email';
import JdmaResetPasswordEmail from '@/react-email/emails/jdma-reset-password-email';
import JdmaInviteEmail from '@/react-email/emails/jdma-invite-email';
import JdmaUserInviteEmail from '@/react-email/emails/jdma-user-invite-email';
import JdmaClosedButtonOrFormEmail from '@/react-email/emails/jdma-closed-button-or-form-email';
import JdmaProductArchivedEmail from '@/react-email/emails/jdma-product-archived-email';
import JdmaProductRestoredEmail from '@/react-email/emails/jdma-product-restored-email';
import JdmaNotificationsEmail from '@/react-email/emails/jdma-notifications-email';
import {
	JdmaNotificationsEmailProps,
	JdmaTokenEmailProps,
	JdmaUserRequestRefusedEmailProps,
	JdmaClosedButtonOrFormEmailProps,
	JdmaInviteEmailProps,
	JdmaOtpEmailProps,
	JdmaProductArchivedEmailProps,
	JdmaProductRestoredEmailProps,
	JdmaUserInviteEmailProps
} from '@/react-email/emails/interface';

export async function renderUserRequestAcceptedEmail(
	props: JdmaTokenEmailProps
): Promise<string> {
	return await render(<JdmaUserRequestAcceptedEmail {...props} />);
}

export async function renderUserRequestRefusedEmail(
	props: JdmaUserRequestRefusedEmailProps
): Promise<string> {
	return await render(<JdmaUserRequestRefusedEmail {...props} />);
}

export async function renderOtpEmail(
	props: JdmaOtpEmailProps
): Promise<string> {
	return await render(<JdmaOtpEmail {...props} />);
}

export async function renderRegisterEmail(
	props: JdmaTokenEmailProps
): Promise<string> {
	return await render(<JdmaRegisterEmail {...props} />);
}

export async function renderResetPasswordEmail(
	props: JdmaTokenEmailProps
): Promise<string> {
	return await render(<JdmaResetPasswordEmail {...props} />);
}

export async function renderInviteEmail(
	props: JdmaInviteEmailProps
): Promise<string> {
	return await render(<JdmaInviteEmail {...props} />);
}

export async function renderUserInviteEmail(
	props: JdmaUserInviteEmailProps
): Promise<string> {
	return await render(<JdmaUserInviteEmail {...props} />);
}

export async function renderClosedButtonOrFormEmail(
	props: JdmaClosedButtonOrFormEmailProps
): Promise<string> {
	return await render(<JdmaClosedButtonOrFormEmail {...props} />);
}

export async function renderProductArchivedEmail(
	props: JdmaProductArchivedEmailProps
): Promise<string> {
	return await render(<JdmaProductArchivedEmail {...props} />);
}

export async function renderProductRestoredEmail(
	props: JdmaProductRestoredEmailProps
): Promise<string> {
	return await render(<JdmaProductRestoredEmail {...props} />);
}

export async function renderNotificationsEmail(
	props: JdmaNotificationsEmailProps
): Promise<string> {
	return await render(<JdmaNotificationsEmail {...props} />);
}
