require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

console.log("MONGO_URI =", process.env.MONGO_URI); 
connectDB(); // 👈 THIS LINE WAS MISSING

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});