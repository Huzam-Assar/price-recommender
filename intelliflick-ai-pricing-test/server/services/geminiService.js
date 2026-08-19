import { GoogleGenAI } from "@google/genai";
import { validateAIRecommendation } from "../utils/aiRecommendationValidation.js";
import { getCurrencyForCountry } from "../utils/countryCurrency.js";

export const DEFAULT_GEMINI_MODELS = ["gemini-3.6-flash", "gemini-3-flash-preview", "gemini-2.0-flash"];

export async function getTuitionPriceRecommendation(requirements) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await generateWithAvailableModel(ai, requirements);

  const parsed = parseGeminiJson(response.text);
  const validation = validateAIRecommendation(parsed, requirements.country);
  if (!validation.isValid) {
    throw new Error(validation.message || "Invalid Gemini response.");
  }

  return parsed;
}

export async function generateWithAvailableModel(ai, requirements) {
  const models = getModelCandidates();
  let lastError;

  for (const model of models) {
    try {
      return await ai.models.generateContent({
        model,
        contents: buildPrompt(requirements),
        config: {
          responseMimeType: "application/json"
        }
      });
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) {
        throw error;
      }
      console.warn(`Gemini model unavailable, trying next candidate: ${model}`);
    }
  }

  throw lastError || new Error("No Gemini model candidates are configured.");
}

export function getModelCandidates() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  return configuredModel ? [configuredModel, ...DEFAULT_GEMINI_MODELS] : DEFAULT_GEMINI_MODELS;
}

function isModelUnavailableError(error) {
  const message = typeof error?.message === "string" ? error.message : JSON.stringify(error);
  return message.includes('"code":404') || message.includes("NOT_FOUND") || message.includes("not found");
}

export function buildPrompt(requirements) {
  const currency = getCurrencyForCountry(requirements.country);
  return `You are IntelliFlick's AI Tuition Pricing Assistant.

Analyze the tuition requirements provided below and estimate a reasonable tuition price.

Consider:

- Country (use the currency commonly used there)
- Mode of Tuition
- Preferred Language
- Rate Type
- Preferred Days
- Preferred Time
- Number of Time Slots
- Classes Per Week
- Class / Grade
- Subject / Course
- Subjects
- Preferred Tutor Gender
- Rate Preference
- Additional Information

Based ONLY on the current tuition requirements, provide a reasonable AI-estimated tuition price and return ${currency} as the currency code for ${requirements.country}.

There is NO historical pricing data available.

Do NOT claim that you have access to IntelliFlick's historical prices.
Do NOT claim that you have access to real-time market prices.

Return ONLY valid JSON with these fields:

{
  "predictedPrice": 0,
  "minimumPrice": 0,
  "maximumPrice": 0,
  "currency": "${currency}",
  "rateType": "Monthly",
  "confidence": "Low",
  "reason": "Brief explanation."
}

Rules:

1. Set currency exactly to "${currency}".
2. Respect the user's selected rate type.
3. Consider all provided requirements.
4. predictedPrice should normally be between minimumPrice and maximumPrice.
5. Provide a reasonable price range.
6. If information is missing, make a reasonable estimate using available information.
7. Do not ask follow-up questions.
8. Do not invent historical data.
9. Do not claim the price is guaranteed.
10. Keep the explanation short.
11. Return ONLY the JSON object.

Actual form data:
${JSON.stringify(requirements, null, 2)}`;
}

export function parseGeminiJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned an empty response.");
  }

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }
}
