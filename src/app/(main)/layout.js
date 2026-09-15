// src/app/(main)/layout.js
import AppToaster from "@/components/AppToaster";
import Footer from "@/components/Footer";
import { getCurrentSession } from "@/lib/getCurrentSession";
import Navbar from "@/components/Navbar";
import PostHogProvider from "@/components/PostHogProvider";
import UpgradeModalProvider from "@/components/UpgradeModalProvider";
import { redirect } from "next/navigation";
import { resolveBetaAccess } from "@/lib/resolveBetaAccess";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MainLayout({ children }) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.accountDeleted) {
    redirect("/login");
  }

  if (!(await resolveBetaAccess(session))) {
    redirect("/?beta=required");
  }

  return (
    <PostHogProvider>
      <div className="dynamic-viewport-height flex flex-col overflow-hidden bg-[#060E1A]">
        <Navbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
        <UpgradeModalProvider />
        <AppToaster />
        {/* <Footer /> */}
      </div>
    </PostHogProvider>
  );
}
