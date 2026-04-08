require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.PERSPECTIVE_API_KEY;
console.log("Perspective API Key:", API_KEY ? "LOADED ✅" : "MISSING ❌");


const PERSPECTIVE_URL =
  "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";

async function analyzeText(text) {
  const response = await axios.post(
    `${PERSPECTIVE_URL}?key=${API_KEY}`,
    {
      comment: { text },
      requestedAttributes: {
        TOXICITY: {}
      }
    }
  );

  return response.data;
}

module.exports = analyzeText;
