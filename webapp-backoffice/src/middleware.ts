// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.JWT_SECRET
	});

	if (
		request.nextUrl.pathname.startsWith('/_next') || // exclude Next.js internals
		request.nextUrl.pathname.startsWith('/api') || //  exclude all API routes
		request.nextUrl.pathname.startsWith('/static') || // exclude static files
		request.nextUrl.pathname.startsWith('/open-api') || // exclude api doc
		request.nextUrl.pathname.startsWith('/public') || // exclude api doc
		request.nextUrl.pathname.startsWith('/reset-password') || // exclude reset password
		PUBLIC_FILE.test(request.nextUrl.pathname) // exclude all files in the public folder
	)
		return NextResponse.next();

	if (request.nextUrl.pathname.startsWith('/administration') && !token) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		url.searchParams.set('callbackUrl', request.nextUrl.pathname);
		return NextResponse.redirect(url);
	} else if (
		!request.nextUrl.pathname.startsWith('/administration') &&
		!!token
	) {
		return NextResponse.redirect(
			new URL('/administration/dashboard/products', request.url)
		);
	}
}
