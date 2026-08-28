"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PricingLink({ children, onClick, ...props }) {
  const pathname = usePathname();

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (pathname !== "/" || window.location.hash !== "#pricing") return;

    event.preventDefault();
    document
      .getElementById("pricing")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Link href="/#pricing" {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
