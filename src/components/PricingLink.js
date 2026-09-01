"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function PricingLink({ children, onClick, ...props }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    if (pathname !== "/") {
      const upgradeEvent = new CustomEvent("upgrade-modal:open", {
        cancelable: true,
      });

      const handled = !window.dispatchEvent(upgradeEvent);
      if (!handled) {
        router.push("/#pricing");
      }
      return;
    }

    if (window.location.hash !== "#pricing") {
      window.history.pushState(null, "", "/#pricing");
    }

    document
      .getElementById("pricing")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const className = props.className
    ? `${props.className} cursor-pointer`
    : "cursor-pointer";

  return (
    <Link href="/#pricing" {...props} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
