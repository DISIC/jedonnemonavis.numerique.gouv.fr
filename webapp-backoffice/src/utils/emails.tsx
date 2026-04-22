import { render } from 'react-email';
import JdmaUserRequestAcceptedEmail from '@/emails/jdma-user-request-accepted-email';
import JdmaUserRequestRefusedEmail from '@/emails/jdma-user-request-refused-email';
import JdmaOtpEmail from '@/emails/jdma-otp-email';
import JdmaRegisterEmail from '@/emails/jdma-register-email';
import JdmaResetPasswordEmail from '@/emails/jdma-reset-password-email';
import JdmaInviteEmail from '@/emails/jdma-invite-email';
import JdmaUserInviteEmail from '@/emails/jdma-user-invite-email';
import JdmaClosedButtonOrFormEmail from '@/emails/jdma-closed-button-or-form-email';
import JdmaProductArchivedEmail from '@/emails/jdma-product-archived-email';
import JdmaProductRestoredEmail from '@/emails/jdma-product-restored-email';
import JdmaNotificationsEmail from '@/emails/jdma-notifications-email';
import JdmaAlertEmail from '@/emails/jdma-alert-email';
import {
	JdmaAlertEmailProps,
	JdmaNotificationsEmailProps,
	JdmaTokenEmailProps,
	JdmaUserRequestRefusedEmailProps,
	JdmaClosedButtonOrFormEmailProps,
	JdmaInviteEmailProps,
	JdmaOtpEmailProps,
	JdmaProductArchivedEmailProps,
	JdmaProductRestoredEmailProps,
	JdmaUserInviteEmailProps
} from '@/emails/interface';

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

export async function renderAlertEmail(
	props: JdmaAlertEmailProps
): Promise<string> {
	return await render(<JdmaAlertEmail {...props} />);
}
