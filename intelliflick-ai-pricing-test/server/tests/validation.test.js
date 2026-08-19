import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_GEMINI_MODELS, getModelCandidates, parseGeminiJson } from "../services/geminiService.js";
import { validateAIRecommendation } from "../utils/aiRecommendationValidation.js";
import { sanitizeTuitionRequirements, validateTuitionRequirements } from "../utils/tuitionValidation.js";

const validRequirements = {
  modeOfTuition: "Online",
  country: "Pakistan",
  preferredLanguage: "English",
  rateType: "Monthly",
  preferredDays: ["Monday", "Wednesday", "Friday"],
  timeSlots: [{ from: "17:00", to: "19:00" }],
  classesPerWeek: 3,
  classGrade: "Grade 10",
  subjectCourse: "Physics",
  subjects: "Physics and Chemistry",
  preferredTutorGender: "Any",
  ratePreference: "Negotiable",
  additionalInformation: "Need a demo class"
};

test("validates tuition requirements", () => {
  assert.equal(validateTuitionRequirements(validRequirements).isValid, true);
});

test("rejects invalid time slots", () => {
  const result = validateTuitionRequirements({
    ...validRequirements,
    timeSlots: [{ from: "25:00", to: "19:00" }]
  });

  assert.equal(result.isValid, false);
});

test("sanitizes text fields", () => {
  const sanitized = sanitizeTuitionRequirements({
    ...validRequirements,
    preferredLanguage: " <English> "
  });

  assert.equal(sanitized.preferredLanguage, "English");
});

test("validates AI recommendation shape", () => {
  const result = validateAIRecommendation({
    predictedPrice: 22000,
    minimumPrice: 18000,
    maximumPrice: 26000,
    currency: "PKR",
    rateType: "Monthly",
    confidence: "Medium",
    reason: "The estimate considers grade, subjects, mode, and weekly classes."
  }, "Pakistan");

  assert.equal(result.isValid, true);
});

test("rejects out-of-range AI prices", () => {
  const result = validateAIRecommendation({
    predictedPrice: 15000,
    minimumPrice: 18000,
    maximumPrice: 26000,
    currency: "PKR",
    rateType: "Monthly",
    confidence: "Medium",
    reason: "Invalid range."
  }, "Pakistan");

  assert.equal(result.isValid, false);
});

test("parses Gemini JSON without eval", () => {
  const parsed = parseGeminiJson(`
    {
      "predictedPrice": 22000,
      "minimumPrice": 18000,
      "maximumPrice": 26000,
      "currency": "PKR",
      "rateType": "Monthly",
      "confidence": "Medium",
      "reason": "Short reason."
    }
  `);

  assert.equal(parsed.currency, "PKR");
});

test("rejects AI currency that does not match country", () => {
  const result = validateAIRecommendation({
    predictedPrice: 22000,
    minimumPrice: 18000,
    maximumPrice: 26000,
    currency: "USD",
    rateType: "Monthly",
    confidence: "Medium",
    reason: "Wrong currency."
  }, "Pakistan");

  assert.equal(result.isValid, false);
});

test("uses Gemini model fallback candidates", () => {
  assert.deepEqual(getModelCandidates(), DEFAULT_GEMINI_MODELS);
});
