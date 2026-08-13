// src/app/(main)/layout.js
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
