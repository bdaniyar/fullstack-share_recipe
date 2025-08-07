// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Remove the existing SVG loader
    config.module.rules.forEach((rule) => {
      if (rule.test?.toString().includes('svg')) {
        rule.exclude = /\.svg$/i;
      }
    });

    // Add new rule to handle SVGs with SVGR
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
