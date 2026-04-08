const express = require("express");
const router = express.Router();

const {
  analyzeText,
} = require("../controllers/moderation.controller");

router.post("/analyze", analyzeText);

module.exports = router;
