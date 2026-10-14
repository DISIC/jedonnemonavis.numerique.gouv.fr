import * as React from 'react';
import { render } from 'react-email';
import JdmaInviteEmail from '@/emails/jdma-invite-email';
import JdmaUserInviteEmail from '@/emails/jdma-user-invite-email';
import JdmaDnCreatorInviteEmail from '@/emails/jdma-dn-creator-invite-email';
import JdmaClosedButtonOrFormEmail from '@/emails/jdma-closed-button-or-form-email';
import JdmaProductArchivedEmail from '@/emails/jdma-product-archived-email';
import JdmaProductRestoredEmail from '@/emails/jdma-product-restored-email';
import JdmaNotificationsEmail from '@/emails/jdma-notifications-email';
import JdmaAlertEmail from '@/emails/jdma-alert-email';
import JdmaExportReadyEmail from '@/emails/jdma-export-ready-email';
import JdmaExportFailedEmail from '@/emails/jdma-export-failed-email';
import {
	JdmaAlertEmailProps,
	JdmaNotificationsEmailProps,
	JdmaClosedButtonOrFormEmailProps,
	JdmaInviteEmailProps,
	JdmaProductArchivedEmailProps,
	JdmaProductRestoredEmailProps,
	JdmaUserInviteEmailProps,
	JdmaDnCreatorInviteEmailProps,
	JdmaExportReadyEmailProps,
	JdmaExportFailedEmailProps
} from '@/emails/interface';

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

export async function renderDnCreatorInviteEmail(
	props: JdmaDnCreatorInviteEmailProps
): Promise<string> {
	return await render(<JdmaDnCreatorInviteEmail {...props} />);
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

export async function renderExportReadyEmail(
	props: JdmaExportReadyEmailProps
): Promise<string> {
	return await render(<JdmaExportReadyEmail {...props} />);
}

export async function renderExportFailedEmail(
	props: JdmaExportFailedEmailProps
): Promise<string> {
	return await render(<JdmaExportFailedEmail {...props} />);
}

export async function renderAlertEmail(
	props: JdmaAlertEmailProps
): Promise<string> {
	return await render(<JdmaAlertEmail {...props} />);
}
