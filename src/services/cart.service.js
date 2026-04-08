import apiClient from "@/lib/axios";

export async function addToCart({ productId, quantity, priceAtTime }) {
  const response = await apiClient.post("/cart/add", {
    productId,
    quantity,
    priceAtTime,
  });

  return response.data;
}

export async function getCart() {
  const response = await apiClient.get("/cart/");
  return response.data;
}

export async function removeFromCart(productId) {
  const response = await apiClient.delete("/cart/remove", {
    data: { productId },
  });

  return response.data;
}

export async function clearCart() {
  const response = await apiClient.delete("/cart/clear");
  return response.data;
}

export async function toggleWishlist(productId) {
  const response = await apiClient.post("/wishlist/toggle", {
    productId,
  });

  return response.data;
}

export async function getWishlist() {
  const response = await apiClient.get("/wishlist/wishlist");
  return response.data;
}
