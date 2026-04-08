import bcrypt from "bcrypt";

const password = "Admin123"; // your password
const hash = await bcrypt.hash(password, 10);
console.log("Hashed password:", hash);