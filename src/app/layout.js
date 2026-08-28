import { Geist, Geist_Mono } from "next/font/google";
import AppToaster from "@/components/AppToaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "PropInsight — Props Research",
    template: "%s | PropInsight",
  },
  description:
    "Research player props with stats, hit rates, injuries, favorites, and matchup analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://ak-static.cms.nba.com" />
        <link rel="preconnect" href="https://cdn.nba.com" />
        <link rel="dns-prefetch" href="https://ak-static.cms.nba.com" />
        <link rel="dns-prefetch" href="https://cdn.nba.com" />
      </head>
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
