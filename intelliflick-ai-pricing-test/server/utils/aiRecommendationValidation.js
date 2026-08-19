import { getCurrencyForCountry } from "./countryCurrency.js";

const RATE_TYPES = ["Hourly", "Daily", "Monthly"];
const CONFIDENCE_LEVELS = ["Low", "Medium", "High"];

export function validateAIRecommendation(input, expectedCountry = "Pakistan") {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return invalid("AI response must be an object.");
  }

  for (const field of ["predictedPrice", "minimumPrice", "maximumPrice"]) {
    if (typeof input[field] !== "number" || Number.isNaN(input[field]) || input[field] < 0) {
      return invalid(`${field} must be a non-negative number.`);
    }
  }

  if (input.minimumPrice > input.predictedPrice) {
    return invalid("minimumPrice must be less than or equal to predictedPrice.");
  }

  if (input.predictedPrice > input.maximumPrice) {
    return invalid("predictedPrice must be less than or equal to maximumPrice.");
  }

  const expectedCurrency = getCurrencyForCountry(expectedCountry);
  if (input.currency !== expectedCurrency) return invalid(`currency must be ${expectedCurrency}.`);
  if (!RATE_TYPES.includes(input.rateType)) return invalid("rateType is invalid.");
  if (!CONFIDENCE_LEVELS.includes(input.confidence)) return invalid("confidence is invalid.");
  if (typeof input.reason !== "string" || !input.reason.trim()) return invalid("reason is required.");

  input.reason = input.reason.trim().slice(0, 500);
  return { isValid: true };
}

function invalid(message) {
  return { isValid: false, message };
}
