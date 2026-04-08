"use client";

import SellerProductsView from "@/components/SellerProductsView";
import { getMyOutOfStockProducts } from "@/services/product.service";

export default function OutOfStockProductsPage() {
  return (
    <SellerProductsView
      title="Out of stock products"
      subtitle="These products were marked out of stock by the backend stock logic."
      loadProducts={getMyOutOfStockProducts}
      emptyDescription="No out-of-stock products were found."
      allowEdit={false}
      allowVisibilityAction={false}
    />
  );
}
