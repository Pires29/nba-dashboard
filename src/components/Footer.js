import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#060E1A]">
      <div className="max-w-[900px] mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[10px] font-mono text-slate-700">
          © {year} HoopiQ. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {[
            { href: "/faqs", label: "FAQs" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] font-mono text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}