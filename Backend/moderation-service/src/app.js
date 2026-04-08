require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

// routes
const moderationRoutes = require("./routes/moderation.routes");

app.use("/api/moderation", moderationRoutes);

module.exports = app;
