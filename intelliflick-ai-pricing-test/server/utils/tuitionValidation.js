import { SUPPORTED_COUNTRIES } from "./countryCurrency.js";

const MODES = ["Online", "Physical", "Hybrid"];
const RATE_TYPES = ["Hourly", "Daily", "Monthly"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TUTOR_GENDERS = ["Any", "Male", "Female"];
const RATE_PREFERENCES = ["Negotiable", "Open to offers", "Fixed"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const MAX_LENGTHS = {
  preferredLanguage: 80,
  classGrade: 120,
  subjectCourse: 160,
  subjects: 200,
  additionalInformation: 500
};

export function validateTuitionRequirements(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return invalid("Request body must be an object.");
  }

  if (!MODES.includes(input.modeOfTuition)) return invalid("Mode of Tuition is invalid.");
  if (!RATE_TYPES.includes(input.rateType)) return invalid("Rate Type is invalid.");
  if (!TUTOR_GENDERS.includes(input.preferredTutorGender)) return invalid("Preferred Tutor Gender is invalid.");
  if (!RATE_PREFERENCES.includes(input.ratePreference)) return invalid("Rate Preference is invalid.");

  for (const field of ["preferredLanguage", "classGrade", "subjectCourse", "subjects"]) {
    const value = input[field];
    if (typeof value !== "string" || !value.trim()) return invalid(`${field} is required.`);
    if (value.trim().length > MAX_LENGTHS[field]) return invalid(`${field} is too long.`);
  }

  if (
    typeof input.additionalInformation !== "undefined" &&
    (typeof input.additionalInformation !== "string" ||
      input.additionalInformation.length > MAX_LENGTHS.additionalInformation)
  ) {
    return invalid("Additional Information is too long.");
  }

  if (typeof input.country !== "undefined" && !SUPPORTED_COUNTRIES.includes(input.country)) {
    return invalid("Country is invalid.");
  }

  if (!Array.isArray(input.preferredDays) || input.preferredDays.length === 0) {
    return invalid("Preferred Days must include at least one day.");
  }

  if (!input.preferredDays.every((day) => DAYS.includes(day))) {
    return invalid("Preferred Days contains an invalid day.");
  }

  if (!Array.isArray(input.timeSlots) || input.timeSlots.length === 0 || input.timeSlots.length > 5) {
    return invalid("Preferred Time must include between 1 and 5 time slots.");
  }

  for (const slot of input.timeSlots) {
    if (!slot || typeof slot !== "object") return invalid("Each time slot must be an object.");
    if (!TIME_PATTERN.test(slot.from) || !TIME_PATTERN.test(slot.to)) {
      return invalid("Each time slot must use HH:mm format.");
    }
  }

  const validClassesPerWeek =
    input.classesPerWeek === "5+" ||
    (Number.isInteger(input.classesPerWeek) && input.classesPerWeek >= 1 && input.classesPerWeek <= 5);

  if (!validClassesPerWeek) {
    return invalid("Classes Per Week must be 1, 2, 3, 4, 5, or 5+.");
  }

  return { isValid: true };
}

export function sanitizeTuitionRequirements(input) {
  return {
    country: SUPPORTED_COUNTRIES.includes(input.country) ? input.country : "Pakistan",
    modeOfTuition: input.modeOfTuition,
    preferredLanguage: cleanString(input.preferredLanguage),
    rateType: input.rateType,
    preferredDays: [...new Set(input.preferredDays)],
    timeSlots: input.timeSlots.map((slot) => ({
      from: slot.from,
      to: slot.to
    })),
    classesPerWeek: input.classesPerWeek,
    classGrade: cleanString(input.classGrade),
    subjectCourse: cleanString(input.subjectCourse),
    subjects: cleanString(input.subjects),
    preferredTutorGender: input.preferredTutorGender,
    ratePreference: input.ratePreference,
    additionalInformation: cleanString(input.additionalInformation || "")
  };
}

function cleanString(value) {
  return value.trim().replace(/[<>]/g, "");
}

function invalid(message) {
  return { isValid: false, message };
}
