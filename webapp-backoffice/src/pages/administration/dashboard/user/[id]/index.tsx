import { omitPassword } from '@/src/server/routers/user/utils';
import prisma from '@/src/utils/db';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import { isAuthTokenValid } from '@/src/utils/proconnect';

const AccountPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id } = context.query;

	const focusedUser = await prisma.user.findUnique({
		where: {
			id: parseInt(id as string)
		},
		include: {
			accessRights: {
				include: {
					product: {
						include: {
							entity: true
						}
					}
				}
			},
			adminEntityRights: {
				include: {
					entity: {
						include: {
							products: true
						}
					}
				}
			}
		}
	});

	const currentUserToken = await getToken({
		req: context.req,
		secret: process.env.JWT_SECRET
	});

	if (!isAuthTokenValid(currentUserToken)) {
		await prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	const currentUser = await prisma.user.findUnique({
		where: {
			email: currentUserToken.email as string
		}
	});

	if (!currentUser) {
		await prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	const isAdmin = currentUser.role.includes('admin');

	if (!isAdmin && currentUser.id !== focusedUser?.id) {
		await prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	await prisma.$disconnect();

	return {
		props: {
			isOwn: focusedUser?.id === currentUser.id,
			userId: focusedUser?.id,
			user: JSON.parse(
				JSON.stringify(focusedUser ? omitPassword(focusedUser) : null)
			)
		}
	};
};

export default AccountPage;
