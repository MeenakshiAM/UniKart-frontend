const cartRepo = require("../repositories/cart.repository");
const calculateTotal = (items) => {
  return items.reduce((acc, item) => {
    return acc + item.quantity * item.priceAtTime;
  }, 0);
};

exports.addToCart = async (userId, productId, quantity, priceAtTime) => {
  const hasPrice = priceAtTime !== undefined && priceAtTime !== null;

  if (!userId || !productId || !quantity || !hasPrice) {
    throw new Error("Missing required fields");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  let cart = await cartRepo.findByUserId(userId);

  if (!cart) {
    cart = await cartRepo.createCart({
      userId,
      items: [{ productId, quantity, priceAtTime }]
    });
  } else {
    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += quantity;
      cart.items[index].priceAtTime = priceAtTime;
    } else {
      cart.items.push({ productId, quantity, priceAtTime });
    }
  }

  cart.totalPrice = calculateTotal(cart.items);

  await cartRepo.saveCart(cart);

  return cart;
};
exports.getCart = async (userId) => {
  const cart = await cartRepo.findByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  return cart;
};
exports.removeFromCart = async (userId, productId) => {

  const cart = await cartRepo.findByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  cart.totalPrice = calculateTotal(cart.items);

  await cartRepo.saveCart(cart);

  return cart;
};
exports.clearCart = async (userId) => {

  const cart = await cartRepo.findByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];
  cart.totalPrice = 0;

  await cartRepo.saveCart(cart);

  return cart;
};
