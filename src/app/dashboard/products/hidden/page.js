"use client";

import SellerProductsView from "@/components/SellerProductsView";
import { getMyHiddenProducts } from "@/services/product.service";

export default function HiddenProductsPage() {
  return (
    <SellerProductsView
      title="Hidden products"
      subtitle="Hidden items can be restored with the unhide action."
      loadProducts={getMyHiddenProducts}
      emptyDescription="No hidden products were found."
      showUnhide
      allowEdit={false}
    />
  );
}
