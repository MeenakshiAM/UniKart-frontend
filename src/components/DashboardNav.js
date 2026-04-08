"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard/products", label: "My Products" },
  { href: "/dashboard/products/drafts", label: "Drafts" },
  { href: "/dashboard/products/rejected", label: "Rejected" },
  { href: "/dashboard/products/hidden", label: "Hidden" },
  { href: "/dashboard/products/out-of-stock", label: "Out of Stock" },
  { href: "/dashboard/products/create", label: "Create Product" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "btn-primary text-sm"
                : "rounded-full border border-[rgba(114,75,43,0.14)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)]"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
