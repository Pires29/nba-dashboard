// src/app/(main)/layout.js
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 min-h-0 overflow-auto lg:overflow-hidden">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
