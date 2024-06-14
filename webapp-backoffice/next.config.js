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
	assetPrefix: '/v2'
};

module.exports = nextConfig;
