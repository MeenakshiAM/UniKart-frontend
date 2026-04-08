const express = require("express");
const router = express.Router();
const { analyzeImages } = require("../controllers/moderationImage.controller");

router.post("/images", analyzeImages);

module.exports = router;
