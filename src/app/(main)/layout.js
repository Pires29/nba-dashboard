// src/app/(main)/layout.js
import AppToaster from "@/components/AppToaster";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PostHogProvider from "@/components/PostHogProvider";
import UpgradeModalProvider from "@/components/UpgradeModalProvider";

export default function MainLayout({ children }) {
  return (
    <PostHogProvider>
      <div className="flex min-h-screen flex-col bg-[#060E1A]">
        <Navbar />
        <main className="flex min-h-0 flex-1 flex-col">
          {children}
        </main>
        <UpgradeModalProvider />
        <AppToaster />
        {/* <Footer /> */}
      </div>
    </PostHogProvider>
  );
}
