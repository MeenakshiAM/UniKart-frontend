"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PageHero from "@/components/PageHero";
import Pagination from "@/components/Pagination";
import ProductCommerceActions from "@/components/ProductCommerceActions";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import StatusMessage from "@/components/StatusMessage";
import { demoProducts, mergeCatalogItems } from "@/data/demoCatalog";
import { addToCart, getWishlist, toggleWishlist } from "@/services/cart.service";
import { getProducts } from "@/services/product.service";
import { getToken } from "@/utils/auth";

const initialFilters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

export default function ProductsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({
    loading: true,
    products: [],
    totalPages: 1,
    error: "",
  });
  const [wishlistIds, setWishlistIds] = useState([]);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [busyAction, setBusyAction] = useState("");

  const fetchProducts = async (pageNumber, activeFilters) => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const data = await getProducts({
        ...activeFilters,
        page: pageNumber,
        limit: 9,
      });
      const backendProducts = data?.products || [];
      const visibleProducts = pageNumber === 1 ? mergeCatalogItems(backendProducts, demoProducts) : backendProducts;

      setState({
        loading: false,
        products: visibleProducts,
        totalPages: data?.totalPages || 1,
        error: "",
      });
    } catch (error) {
      setState({
        loading: false,
        products: pageNumber === 1 ? demoProducts : [],
        totalPages: 1,
        error: error.message || "Unable to load products.",
      });
    }
  };

  const loadWishlist = async () => {
    if (!getToken()) {
      setWishlistIds([]);
      return;
    }

    try {
      const data = await getWishlist();
      setWishlistIds((Array.isArray(data) ? data : []).map((item) => item.productId));
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to load wishlist state.",
      });
    }
  };

  useEffect(() => {
    fetchProducts(page, filters);
  }, [page]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleAddToCart = async (product) => {
    const productPrice = product?.price?.finalPrice ?? product?.price?.basePrice ?? 0;
    setBusyAction(`cart-${product._id}`);
    setStatus({ type: "info", message: "" });

    try {
      const data = await addToCart({
        productId: product._id,
        quantity: 1,
        priceAtTime: productPrice,
      });

      const updatedItems = data?.data?.items || [];
      const existingItem = updatedItems.find((item) => item.productId === product._id);

      setStatus({
        type: "success",
        message: existingItem?.quantity > 1 ? "Cart quantity updated successfully." : "Product added to cart.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to add this product to cart.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const handleToggleWishlist = async (product) => {
    setBusyAction(`wishlist-${product._id}`);
    setStatus({ type: "info", message: "" });

    try {
      const response = await toggleWishlist(product._id);
      const message = response?.message || "Wishlist updated.";

      setWishlistIds((current) =>
        current.includes(product._id) ? current.filter((id) => id !== product._id) : [...current, product._id]
      );
      setStatus({
        type: "success",
        message,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update wishlist.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    fetchProducts(1, filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setPage(1);
    fetchProducts(1, initialFilters);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Marketplace"
        title="Browse products"
        subtitle="This page uses the stable product listing API and supports the exact backend query fields for category, search, price range, sort, and pagination."
      />

      <ProductFilters
        filters={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <StatusMessage type="error">{state.error}</StatusMessage>
      <StatusMessage type={status.type}>{status.message}</StatusMessage>

      {state.loading ? (
        <div className="card-surface rounded-[2rem] p-8 text-sm text-[var(--muted)]">Loading products...</div>
      ) : state.products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting the category, search, or price filters."
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {state.products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                actionArea={
                  <ProductCommerceActions
                    product={product}
                    isWishlisted={wishlistIds.includes(product._id)}
                    busyAction={busyAction}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                  />
                }
              />
            ))}
          </div>

          <Pagination page={page} totalPages={state.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
