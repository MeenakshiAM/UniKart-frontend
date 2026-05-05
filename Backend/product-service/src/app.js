const express = require("express");
const cors = require("cors");

const app = express();

// ================= CORS =================
app.use(cors());

// ================= IMPORTANT FIX =================
// DO NOT parse JSON for multipart/form-data routes
app.use(express.urlencoded({ extended: true }));

// ⚠️ Keep JSON parser BUT AFTER multer routes safety
// (safe for normal APIs like login/register)
app.use(express.json());

// ================= ROUTES =================

const productRoutes = require("./routes/product.routes");
const reviewRoutes = require("./routes/review.routes");
const bookingRoutes = require("./routes/booking.routes");
const serviceRoutes = require("./routes/service.routes");

// ================= MOUNT ROUTES =================

app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);

module.exports = app;