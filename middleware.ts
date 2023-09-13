// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.JWT_SECRET
	});

	if (request.nextUrl.pathname.startsWith('/login') && !!token) {
		return NextResponse.redirect(
			new URL('/administration/dashboard', request.url)
		);
	} else if (request.nextUrl.pathname.startsWith('/administration') && !token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	if (request.nextUrl.pathname.startsWith('') && !!token) {
		return NextResponse.redirect(
			new URL('/administration/dashboard', request.url)
		);
	}
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ['/']
};
