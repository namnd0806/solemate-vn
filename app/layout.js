import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://solemate-vn.vercel.app"),
  title: {
    default: "SoleMate VN – Giày thể thao chính hãng",
    template: "%s | SoleMate VN",
  },
  description: "Khám phá giày thể thao chính hãng từ Nike, Adidas, New Balance và nhiều thương hiệu hàng đầu tại SoleMate VN.",
  openGraph: {
    title: "SoleMate VN – More Than Sneakers",
    description: "Giày thể thao chính hãng, giao nhanh toàn quốc và đổi trả dễ dàng.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="bg-sole-gray text-sole-dark antialiased">{children}</body>
    </html>
  );
}
