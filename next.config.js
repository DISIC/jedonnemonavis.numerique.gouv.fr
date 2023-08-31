/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
  transpilePackages: [
    "@codegouvfr/react-dsfr",
    "tss-react", // This is for MUI or if you use htts://tss-react.dev
  ],
};

module.exports = nextConfig;
