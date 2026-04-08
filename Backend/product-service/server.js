require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
const Product = require("./src/models/Product");
console.log("Product model loaded:", Product.modelName);

