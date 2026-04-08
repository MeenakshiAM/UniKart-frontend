require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

//console.log("MONGO_URI =", process.env.MONGO_URI);

connectDB(); 

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Moderation Service running on port ${PORT}`);
});
