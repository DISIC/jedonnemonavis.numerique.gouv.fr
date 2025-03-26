import prisma from '@/src/utils/db';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';

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

	if (
		!currentUserToken ||
		(currentUserToken.exp as number) < new Date().getTime() / 1000
	) {
		console.log("couldn't find token");
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
		console.log("couldn't find current user");
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
			user: JSON.parse(JSON.stringify(focusedUser))
		}
	};
};

export default AccountPage;
