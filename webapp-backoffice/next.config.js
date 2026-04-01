/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: {
		locales: ['fr'],
		defaultLocale: 'fr'
	},
	webpack: config => {
		config.module.rules.push({
			test: /\.woff2$/,
			type: 'asset/resource'
		});
		return config;
	},
	transpilePackages: [
		'@codegouvfr/react-dsfr',
		'tss-react' // This is for MUI or if you use htts://tss-react.dev
	],
	assetPrefix: '/v2',
	rewrites() {
		return [{ source: '/v2/_next/:path*', destination: '/_next/:path*' }];
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					{ key: 'X-XSS-Protection', value: '0' },
					{ key: 'X-Frame-Options', value: 'DENY' },
				],
			},
		];
	}
};

module.exports = nextConfig;
