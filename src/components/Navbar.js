"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearStoredAuth, getStoredUser } from "@/utils/auth";

const guestLinks = [
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/resend-verification", label: "Resend Verification" },
];

const authLinks = [
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/reports/create", label: "Report" },
  { href: "/reports/my", label: "My Reports" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/products", label: "Seller Products" },
  { href: "/profile", label: "Profile" },
  { href: "/become-seller", label: "Become Seller" },
];

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-changed", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-changed", syncUser);
    };
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = "/login";
  };

  const links = user
    ? user.role === "ADMIN"
      ? [...authLinks, { href: "/admin/reports", label: "Moderation" }]
      : authLinks
    : guestLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(114,75,43,0.12)] bg-[rgba(246,241,232,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#9d3c1f_0%,#d7864a_100%)] text-lg font-bold text-white shadow-lg shadow-orange-200/60">
            U
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Unikart</p>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Student Commerce</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-white/70 hover:text-[var(--text)]"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <button type="button" onClick={handleLogout} className="btn-primary text-sm">
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
