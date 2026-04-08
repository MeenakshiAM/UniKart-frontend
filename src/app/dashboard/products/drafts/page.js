"use client";

import SellerProductsView from "@/components/SellerProductsView";
import { getMyDrafts } from "@/services/product.service";

export default function DraftProductsPage() {
  return (
    <SellerProductsView
      title="Draft products"
      subtitle="Drafts stay private until you publish them through the backend flow."
      loadProducts={getMyDrafts}
      emptyDescription="No draft products were returned by the backend."
    />
  );
}
