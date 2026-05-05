"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts } from "@/services/product.service";
import { addToCart, toggleWishlist, getWishlist } from "@/services/cart.service";
import { getToken } from "@/utils/auth";
import { Search, ShoppingCart, Heart } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [wishlistIds, setWishlistIds] = useState([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        const list = data?.products || [];
        setProducts(list);
        setFiltered(list);
      } catch {
        setProducts([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!getToken()) return;

      try {
        const data = await getWishlist();
        const ids = (Array.isArray(data) ? data : []).map(
          (item) => item.productId
        );
        setWishlistIds(ids);
      } catch {}
    };

    loadWishlist();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    setFiltered(result);
  }, [search, category, products]);

  const categories = [...new Set(products.map((p) => p.category))];

  const handleAddToCart = async (product) => {
    if (!getToken()) {
      setMessage("Login required");
      return;
    }

    setBusy(`cart-${product._id}`);

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        priceAtTime:
          product.price?.finalPrice || product.price?.basePrice,
      });

      setMessage("Added to cart 🛒");
    } catch {
      setMessage("Failed to add");
    } finally {
      setBusy("");
    }
  };

  const handleWishlist = async (product) => {
    if (!getToken()) {
      setMessage("Login required");
      return;
    }

    setBusy(`wish-${product._id}`);

    try {
      await toggleWishlist(product._id);

      setWishlistIds((prev) =>
        prev.includes(product._id)
          ? prev.filter((id) => id !== product._id)
          : [...prev, product._id]
      );

      setMessage("Wishlist updated ❤️");
    } catch {
      setMessage("Failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center mb-8">
        Explore Products 🛍️
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 justify-center">

        <div className="flex items-center border px-3 py-2 rounded-lg w-full max-w-md shadow-sm">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="ml-2 w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border px-3 py-2 rounded-lg shadow-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

      </div>

      {/* PRODUCTS GRID */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No products found</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((product) => {
            const price =
              product.price?.finalPrice || product.price?.basePrice;

            const isOutOfStock = product.quantity === 0;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col"
              >
                {/* IMAGE */}
                <Link href={`/products/${product._id}`}>
                  <img
                    src={product.images?.[0]?.url}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </Link>

                {/* INFO */}
                <div className="mt-4 flex-1">
                  <h2 className="font-semibold text-lg line-clamp-1">
                    {product.title}
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    {product.category}
                  </p>

                  <p className="font-bold text-xl mt-2">
                    ₹{price}
                  </p>

                  {/* 🔥 QUANTITY */}
                  <p
                    className={`text-sm mt-1 ${
                      isOutOfStock
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : `In Stock: ${product.quantity}`}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-4">

                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                    className={`flex items-center justify-center gap-1 flex-1 py-2 rounded-lg text-sm text-white ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    <ShoppingCart size={16} />
                    {busy === `cart-${product._id}` ? "..." : "Cart"}
                  </button>

                  <button
                    onClick={() => handleWishlist(product)}
                    className="flex items-center justify-center px-3 border rounded-lg"
                  >
                    <Heart
                      size={16}
                      fill={
                        wishlistIds.includes(product._id)
                          ? "black"
                          : "none"
                      }
                    />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MESSAGE */}
      {message && (
        <p className="text-center mt-6 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}