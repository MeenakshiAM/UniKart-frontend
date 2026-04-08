const { moderateImage } = require("../services/moderation/visionAnalyzer");
const ModerationLog = require("../models/moderationLog");

exports.analyzeImages = async (req, res) => {
  try {
    const { images = [] } = req.body;

    if (!images.length) {
      return res.status(400).json({ error: "Images are required" });
    }

    const results = [];
    for (const img of images) {
      const result = await moderateImage(img);
      results.push(result);
    }

    const isAllowed = results.every(r => r.isAllowed);

    const log = await ModerationLog.create({
      inputImages: images,
      isAllowed,
      imageDetails: results
    });

    return res.status(200).json({ id: log._id, isAllowed, results });
  } catch (error) {
    console.error("Image moderation error:", error.message);
    return res.status(500).json({ error: "Moderation failed" });
  }
};