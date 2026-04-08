require("dotenv").config();
const path = require("path");
const connectDB = require("./src/config/db");
const { moderateImage } = require("./src/services/moderation/visionAnalyzer");

(async () => {
  try {
    await connectDB();

    // Local image paths
    const testImages = [
      path.join(__dirname, "test-images", "img1.jpg"),
      path.join(__dirname, "test-images", "dress.webp")
    ];

    for (const imgPath of testImages) {
      console.log(`Checking image: ${imgPath}`);
      const result = await moderateImage(imgPath);
      console.log(result);
    }

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
})();