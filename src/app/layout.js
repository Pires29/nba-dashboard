import { Geist, Geist_Mono } from "next/font/google";
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
    default: "HoopiQ — NBA Props Research",
    template: "%s | HoopiQ",
  },
  description:
    "NBA dashboard for player stats, props, injuries, favorites, and matchup analysis.",
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
      <body>{children}</body>
    </html>
  );
}
