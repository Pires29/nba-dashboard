// src/app/(main)/layout.js
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function MainLayout({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 min-h-0 overflow-auto lg:overflow-hidden">
        {children}
      </div>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0D1828",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#cbd5e1",
            fontFamily: "monospace",
            fontSize: "12px",
            borderRadius: "12px",
          },
          classNames: {
            success: "!border-emerald-500/20",
            error: "!border-red-500/20",
            description: "!text-slate-600 !text-[11px]",
          },
        }}
      />
      {/* <Footer /> */}
    </div>
  );
}
