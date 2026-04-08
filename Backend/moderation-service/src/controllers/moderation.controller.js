const {
  analyzeAndDecide
} = require("../services/moderation/moderationEngine");


exports.analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        error: "Text is required for moderation",
      });
    }

    const result = await analyzeAndDecide(text);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Moderation error:", error.message);
    return res.status(500).json({
      error: "Moderation service failed",
    });
  }
};
