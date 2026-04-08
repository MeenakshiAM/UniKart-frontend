const express = require("express");
const router = express.Router();

const moderationController = require("../controllers/moderation.controller");

router.patch("/warn/:id", moderationController.warnUser);

router.patch("/suspend/:id", moderationController.suspendUser);

router.patch("/ban/:id", moderationController.banUser);

module.exports = router;