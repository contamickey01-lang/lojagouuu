/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ecommerce-cdn.b-cdn.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.cloudflare.steamstatic.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'shared.cloudflare.steamstatic.com',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
