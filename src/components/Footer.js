"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* 🧾 BRAND */}
        <div>
          <h2 className="text-xl font-bold mb-2">UniKart</h2>
          <p className="text-gray-600 text-sm">
            A campus marketplace for buying, selling, and offering services.
          </p>
        </div>

        {/* 🔗 LINKS */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/become-seller">Sell</Link></li>
            <li><Link href="/login">Login</Link></li>
          </ul>
        </div>

        {/* 🛟 SUPPORT */}
        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Contact Us</li>
            <li>FAQ</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

      </div>

      {/* 🔻 BOTTOM */}
      <div className="text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} UniKart. All rights reserved.
      </div>
    </footer>
  );
}