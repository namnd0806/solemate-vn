/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "whywiogsaetjkixvreus.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
  },
};

export default nextConfig;
