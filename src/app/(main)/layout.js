// src/app/(main)/layout.js
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
