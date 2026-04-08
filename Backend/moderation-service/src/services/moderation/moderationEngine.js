const analyzeText = require("./textAnalyzer");
const ModerationLog = require("../../models/moderationLog");

const decideModeration = (toxicityScore) => {
  if (toxicityScore < 0.4) {
    return {
      decision: "APPROVED",
      reason: "Low toxicity detected",
    };
  }

 /*  if (toxicityScore <= 0.7) {
    return {
      decision: "PENDING",
      reason: "Moderate toxicity, needs review",
    };
  }
 */
  return {
    decision: "REJECTED",
    reason: "High toxicity detected",
  };
};

const analyzeAndDecide = async (text) => {
  const result = await analyzeText(text);

  const toxicityScore =
    result.attributeScores.TOXICITY.summaryScore.value;

  const moderationResult = decideModeration(toxicityScore);

   const isAllowed = moderationResult.decision === "APPROVED";

  const log = await ModerationLog.create({
    inputText: text,
    toxicityScore,
    decision: moderationResult.decision,
    reason: moderationResult.reason,
    isAllowed
  });

  return {
    id: log._id,
    toxicityScore,
    ...moderationResult,
    isAllowed
  };
};

module.exports = {
  analyzeAndDecide,
  decideModeration,
};
