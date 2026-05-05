"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearStoredAuth, getStoredUser } from "@/utils/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

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

  // 🔥 CLEAN ROLE-BASED LINKS
  let links = [];

if (!user) {
  links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
    //{ href: "/become-seller", label: "Sell" },
    { href: "/login", label: "Login" },
  ];
} else {
  links = [
    { href: "/", label: "Home" },
    { href: "/become-seller", label: "Sell" },
    { href: "/services", label: "Services" },
    { href: "/products", label: "Products" },
  ];
}


  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold">
          UniKart
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-4">

        {/* MAIN LINKS */}
        {links?.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1 text-sm hover:text-orange-600"
          >
            {link.label}
          </Link>
        ))}

        {/* LOGGED-IN FEATURES */}
        {user && (
          <>
            <Link href="/cart" className="text-sm hover:text-orange-600">
              🛒
            </Link>

            <Link href="/wishlist" className="text-sm hover:text-orange-600">
              ❤️
            </Link>

            {/* 👤 PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded bg-orange-500 px-3 py-1 text-white text-sm"
              >
                {user?.name || "Profile"} ⬇
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
                  
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          </>
        )}

      </nav>
      </div>
    </header>
  );
}