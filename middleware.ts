import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
	afterAuth(auth, req) {
		if (auth.userId && auth.isPublicRoute) {
			let path = '/select-workspace';

			if (auth.orgId) {
				path = `/w/${auth.orgId}`;
			}

			const orgSelection = new URL(path, req.url);
			console.log('orgSelection:', orgSelection);
			return NextResponse.redirect(orgSelection);
		}

		if (!auth.userId && !auth.isPublicRoute) {
			return redirectToSignIn({ returnBackUrl: req.url });
		}

		if (
			auth.userId &&
			!auth.orgId &&
			req.nextUrl.pathname !== '/select-workspace'
		) {
			const orgSelection = new URL('/select-workspace', req.url);
			return NextResponse.redirect(orgSelection);
		}
	},
});

export const config = {
	// Protects all routes, including api/trpc.
	// See https://clerk.com/docs/references/nextjs/auth-middleware
	// for more information about configuring your Middleware
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
