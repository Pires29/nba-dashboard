"use client";

import Link from "next/link";

export default function PropsUpgradeButton({ children, className }) {
  return (
    <Link
      href="/#pricing"
      className={`${className ?? ""} cursor-pointer`}
      onClick={(clickEvent) => {
        const event = new CustomEvent("upgrade-modal:open", {
          cancelable: true,
        });
        const handled = !window.dispatchEvent(event);
        if (handled) {
          clickEvent.preventDefault();
        }
      }}
    >
      {children}
    </Link>
  );
}
