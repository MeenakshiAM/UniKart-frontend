const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
