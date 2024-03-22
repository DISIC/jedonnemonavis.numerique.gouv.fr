import { signOut, useSession } from 'next-auth/react';
import React, { ReactNode, createContext } from 'react';

const AuthContext = createContext(null);

interface AuthProviderProps {
	children: ReactNode;
}

const isExpired = (expireDate: string) => {
	const now = new Date();
	const expire = new Date(expireDate);
	return now > expire;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const { data: session } = useSession();

	if (session?.expires && isExpired(session?.expires)) {
		signOut();
	}

	return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};
