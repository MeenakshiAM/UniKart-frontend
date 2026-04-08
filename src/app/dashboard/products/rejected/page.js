"use client";

import SellerProductsView from "@/components/SellerProductsView";
import { getMyRejectedProducts } from "@/services/product.service";

export default function RejectedProductsPage() {
  return (
    <SellerProductsView
      title="Rejected products"
      subtitle="These products were rejected and may need content changes before resubmission."
      loadProducts={getMyRejectedProducts}
      emptyDescription="No rejected products were found."
      allowEdit={false}
      allowVisibilityAction={false}
    />
  );
}
