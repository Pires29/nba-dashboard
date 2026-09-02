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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "PropInsight — NBA Player Props Research",
    template: "%s | PropInsight",
  },
  description:
    "Research NBA player props with hit rates, player trends, injuries, matchup stats, favorites, and slate analysis.",
  openGraph: {
    type: "website",
    siteName: "PropInsight",
    title: "PropInsight — NBA Player Props Research",
    description:
      "Research NBA player props with hit rates, player trends, injuries, matchup stats, and slate analysis.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropInsight — NBA Player Props Research",
    description:
      "Research NBA player props with hit rates, player trends, injuries, matchup stats, and slate analysis.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
