const express = require("express");
const cors = require("cors");

const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

module.exports = app;