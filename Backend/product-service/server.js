require("dotenv").config();

const express = require("express"); // 🔥 MUST IMPORT
const app = require("./src/app");

const connectDB = require("./src/config/db");

// ---------------- MIDDLEWARE FIX ----------------
app.use(express.urlencoded({ extended: true })); // 🔥 for form-data parsing
//app.use(express.json()); // keep JSON support

// ---------------- DB ----------------
connectDB();

// ---------------- DEBUG MODEL ----------------
const Product = require("./src/models/Product");
console.log("Product model loaded:", Product.modelName);

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});