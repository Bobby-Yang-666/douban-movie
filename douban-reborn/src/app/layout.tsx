import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

const sans = Manrope({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-app-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "映场",
  description: "一个偏向真实影迷口碑的电影评分与评论站点，会自动同步豆瓣正在上映影片。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${display.variable} antialiased`}>{children}</body>
    </html>
  );
}
