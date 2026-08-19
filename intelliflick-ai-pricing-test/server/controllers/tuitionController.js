import TuitionAIRecommendation from "../models/TuitionAIRecommendation.js";
import { getTuitionPriceRecommendation } from "../services/geminiService.js";
import { sanitizeTuitionRequirements, validateTuitionRequirements } from "../utils/tuitionValidation.js";

const GENERIC_ERROR_MESSAGE = "Unable to generate an AI price recommendation.";

export async function recommendTuitionPrice(req, res) {
  try {
    const validation = validateTuitionRequirements(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message || GENERIC_ERROR_MESSAGE
      });
    }

    const requirements = sanitizeTuitionRequirements(req.body);
    const aiRecommendation = await getTuitionPriceRecommendation(requirements);

    await TuitionAIRecommendation.create({
      requirements,
      aiRecommendation
    });

    return res.json({
      success: true,
      data: aiRecommendation
    });
  } catch (error) {
    console.error("AI recommendation failed:", error.message);
    return res.status(500).json({
      success: false,
      message: GENERIC_ERROR_MESSAGE
    });
  }
}
