const withTM = require('next-transpile-modules')([
  '@project-serum/sol-wallet-adapter',
]);

module.exports = withTM({
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  webpack5: true,
  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
});
