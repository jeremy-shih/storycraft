/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir:
        process.env.NEXT_PUBLIC_E2E_MOCK_AUTH === "true"
            ? ".next-e2e"
            : ".next",
    experimental: {
        serverActions: {
            bodySizeLimit: 10 * 1024 * 1024, // Changed from maxRequestBodySize to bodySizeLimit
        },
    },
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
            },
        ],
    },

    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "origin-when-cross-origin",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
