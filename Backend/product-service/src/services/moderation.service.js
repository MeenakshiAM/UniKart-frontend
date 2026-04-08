const axios = require("axios");

class ModerationService {

  async moderateContent(text) {

    try {

      const response = await axios.post(
        "http://localhost:4003/api/moderation/analyze",
        { text }
      );

      return response.data;

    } catch (error) {

      console.error("Moderation service unavailable:", error.message);

      return {
        isAllowed: true,
        reason: null
      };

    }

  }

}

module.exports = new ModerationService();