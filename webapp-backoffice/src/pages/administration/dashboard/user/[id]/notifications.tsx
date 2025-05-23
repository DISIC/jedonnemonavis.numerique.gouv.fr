import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { NotificationFrequency } from '@prisma/client';
import { useRouter } from 'next/router';

interface Props {
	isOwn: Boolean;
	userId: number;
	user: User;
}

const NotificationsAccount: React.FC<Props> = props => {
	const { userId, isOwn, user } = props;
	const utils = trpc.useUtils();
	const router = useRouter();

	const { mutateAsync: updateUser } = trpc.user.update.useMutation({
		onSuccess: async () => {
			router.replace(router.asPath);
		}
	});

	const { classes } = useStyles();

	const handleNotificationsChange = async (
		notifications: boolean,
		notificationsFrequency: NotificationFrequency
	): Promise<void> => {
		await updateUser({
			id: userId,
			user: {
				notifications,
				notifications_frequency: notificationsFrequency
			}
		});
	};

	return (
		<>
			<AccountLayout isOwn={isOwn} user={user}>
				<Head>
					<title>
						{`${user.firstName} ${user.lastName}`} | Compte Notifications | Je
						donne mon avis
					</title>
					<meta
						name="description"
						content={`${user.firstName} ${user.lastName} | Form Notifications | Je donne mon avis`}
					/>
				</Head>
				<div className={classes.column}>
					<div className={classes.headerWrapper}>
						<h2>Notifications</h2>
					</div>
					<div className={classes.notificationsWrapper}>
						<h3>Par e-mail</h3>
						<div className={classes.divider} />
						<form className={classes.form}>
							<ToggleSwitch
								label="Recevoir une sythèse des nouveaux avis sur les services que vous administrez"
								inputTitle="notifications"
								labelPosition="left"
								showCheckedHint={false}
								defaultChecked={user.notifications}
								onChange={e => handleNotificationsChange(e, 'daily')}
							/>
							{user.notifications && (
								<RadioButtons
									legend="Fréquence de la synthèse"
									name="notifications-frequency"
									options={[
										{
											label:
												'Journalière (tous les jours à 08h heure de Paris)',
											nativeInputProps: {
												value: user.notifications_frequency,
												checked: user.notifications_frequency === 'daily',
												onChange: () => handleNotificationsChange(true, 'daily')
											}
										},
										{
											label: 'Hebdo (tous les lundis à 08h heure de Paris)',
											nativeInputProps: {
												value: user.notifications_frequency,
												checked: user.notifications_frequency === 'weekly',
												onChange: () =>
													handleNotificationsChange(true, 'weekly')
											}
										},
										{
											label:
												'Mensuelle (tous les premiers lundis de chaque mois à 08h heure de Paris)',
											nativeInputProps: {
												value: user.notifications_frequency,
												checked: user.notifications_frequency === 'monthly',
												onChange: () =>
													handleNotificationsChange(true, 'monthly')
											}
										}
									]}
								/>
							)}
						</form>
					</div>
				</div>
			</AccountLayout>
		</>
	);
};

const useStyles = tss.withName(NotificationsAccount.name).create({
	loaderWrapper: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh'
	},
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
	},
	droppableArea: {
		padding: '8px',
		backgroundColor: '#f4f4f4',
		minHeight: '200px'
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	},
	notificationsWrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v'),
		padding: '32px',
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	divider: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	notificationToggle: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('4v')
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v')
	}
});

export default NotificationsAccount;

export { getServerSideProps };
