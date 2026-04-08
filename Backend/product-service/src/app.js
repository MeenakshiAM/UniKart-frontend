const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================= ROUTES =================

const productRoutes = require("./routes/product.routes");
const reviewRoutes = require("./routes/review.routes");
const bookingRoutes = require("./routes/booking.routes");
const serviceRoutes = require("./routes/service.routes");

app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);

module.exports = app;