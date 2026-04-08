require("dotenv").config();
const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient();

const moderateImage = async (imageUrl) => {
  try {
    const [result] = await client.safeSearchDetection(imageUrl);
    const detections = result.safeSearchAnnotation;

    const { adult, violence, racy } = detections;

    const isAllowed = [adult, violence, racy].every(
      (cat) => cat === "VERY_UNLIKELY" || cat === "UNLIKELY"
    );

    return { isAllowed, details: detections, imageUrl };
  } catch (error) {
    console.error("Vision API error:", error);
    return { isAllowed: false, details: null, imageUrl, error: error.message };
  }
};

module.exports = { moderateImage };