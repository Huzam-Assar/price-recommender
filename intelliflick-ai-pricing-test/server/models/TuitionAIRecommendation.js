import mongoose from "mongoose";
import { SUPPORTED_COUNTRIES } from "../utils/countryCurrency.js";

const timeSlotSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  { _id: false }
);

const requirementsSchema = new mongoose.Schema(
  {
    modeOfTuition: { type: String, enum: ["Online", "Physical", "Hybrid"], required: true },
    preferredLanguage: { type: String, required: true, maxlength: 80 },
    rateType: { type: String, enum: ["Hourly", "Daily", "Monthly"], required: true },
    preferredDays: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    timeSlots: { type: [timeSlotSchema], required: true },
    classesPerWeek: { type: mongoose.Schema.Types.Mixed, required: true },
    classGrade: { type: String, required: true, maxlength: 120 },
    subjectCourse: { type: String, required: true, maxlength: 160 },
    subjects: { type: String, required: true, maxlength: 200 },
    country: { type: String, enum: SUPPORTED_COUNTRIES, default: "Pakistan" },
    preferredTutorGender: { type: String, enum: ["Any", "Male", "Female"], required: true },
    ratePreference: { type: String, enum: ["Negotiable", "Open to offers", "Fixed"], required: true },
    additionalInformation: { type: String, maxlength: 500, default: "" }
  },
  { _id: false }
);

const aiRecommendationSchema = new mongoose.Schema(
  {
    predictedPrice: { type: Number, required: true, min: 0 },
    minimumPrice: { type: Number, required: true, min: 0 },
    maximumPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    rateType: { type: String, enum: ["Hourly", "Daily", "Monthly"], required: true },
    confidence: { type: String, enum: ["Low", "Medium", "High"], required: true },
    reason: { type: String, required: true, maxlength: 500 }
  },
  { _id: false }
);

const tuitionAIRecommendationSchema = new mongoose.Schema(
  {
    requirements: { type: requirementsSchema, required: true },
    aiRecommendation: { type: aiRecommendationSchema, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("TuitionAIRecommendation", tuitionAIRecommendationSchema);
