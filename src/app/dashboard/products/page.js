"use client";

import SellerProductsView from "@/components/SellerProductsView";
import { getMyProducts } from "@/services/product.service";

export default function DashboardProductsPage() {
  return (
    <SellerProductsView
      title="My products"
      subtitle="Manage the products returned by the stable seller dashboard endpoint."
      loadProducts={getMyProducts}
      emptyDescription="You have not created any products yet."
    />
  );
}
