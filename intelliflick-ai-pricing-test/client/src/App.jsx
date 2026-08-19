import React, { useEffect, useMemo, useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const LOADING_MESSAGES = [
  "☕ Brewing your estimate... sip tight!",
  "🧠 Putting on the thinking cap...",
  "📚 Analyzing your tuition requirements...",
  "🧮 Crunching the numbers...",
  "🤔 Hmm... this one needs some thinking.",
  "💰 Finding the sweet spot...",
  "🎯 Almost there... aiming for the perfect estimate!",
  "🚀 Your price estimate is on its way!"
];

const initialForm = {
  country: "Pakistan",
  modeOfTuition: "Online",
  preferredLanguage: "",
  rateType: "Hourly",
  preferredDays: [],
  timeSlots: [{ from: "", to: "" }],
  classesPerWeek: "",
  classGrade: "",
  subjectCourse: "",
  subjects: "",
  preferredTutorGender: "Any",
  ratePreference: "Negotiable",
  additionalInformation: "",
  termsAccepted: false
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const selectedDaysLabel = useMemo(() => {
    if (form.preferredDays.length === 0) return "No days selected";
    return form.preferredDays.join(", ");
  }, [form.preferredDays]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return undefined;
    }

    const messageTimer = window.setInterval(() => {
      setLoadingMessageIndex((currentIndex) =>
        currentIndex === LOADING_MESSAGES.length - 1 ? currentIndex : currentIndex + 1
      );
    }, 2000);

    return () => window.clearInterval(messageTimer);
  }, [isLoading]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDay = (day) => {
    setForm((current) => {
      const exists = current.preferredDays.includes(day);
      return {
        ...current,
        preferredDays: exists
          ? current.preferredDays.filter((item) => item !== day)
          : [...current.preferredDays, day]
      };
    });
  };

  const selectDays = (type) => {
    const options = {
      Weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      Weekends: ["Saturday", "Sunday"],
      Flexible: DAYS
    };
    updateField("preferredDays", options[type]);
  };

  const updateSlot = (index, field, value) => {
    setForm((current) => ({
      ...current,
      timeSlots: current.timeSlots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const addSlot = () => {
    setForm((current) => ({
      ...current,
      timeSlots: [...current.timeSlots, { from: "", to: "" }]
    }));
  };

  const removeSlot = (index) => {
    setForm((current) => ({
      ...current,
      timeSlots: current.timeSlots.filter((_, slotIndex) => slotIndex !== index)
    }));
  };

  const validateForm = () => {
    const requiredTextFields = [
      ["preferredLanguage", "Preferred Language is required."],
      ["classGrade", "Class / Grade is required."],
      ["subjectCourse", "Subject / Course is required."],
      ["subjects", "Subjects are required."]
    ];

    for (const [field, message] of requiredTextFields) {
      if (!form[field].trim()) return message;
    }

    if (!form.classesPerWeek) return "Classes Per Week is required.";
    if (form.preferredDays.length === 0) return "Please select at least one Preferred Day.";
    if (!form.timeSlots.length || form.timeSlots.some((slot) => !slot.from || !slot.to)) {
      return "Please complete every Preferred Time slot.";
    }
    if (!form.termsAccepted) return "Please agree to the Terms and Conditions.";
    return "";
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...form,
        classesPerWeek: form.classesPerWeek === "5+" ? "5+" : Number(form.classesPerWeek)
      };
      delete payload.termsAccepted;

      const response = await fetch(`${API_BASE_URL}/api/tuition/ai-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.message || "Unable to generate an AI price recommendation.");
      }

      setResult(body.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="tester">
        <div className="intro">
          <h1>IntelliFlick AI Tuition Price Tester</h1>
          <p>Fill in the tuition requirements and ask AI for a price estimate.</p>
        </div>

        <form className="form" onSubmit={submitForm}>
            <Fieldset legend="Mode of Tuition">
              <RadioGroup
                name="modeOfTuition"
                options={["Online", "Physical", "Hybrid"]}
                value={form.modeOfTuition}
                onChange={(value) => updateField("modeOfTuition", value)}
              />
            </Fieldset>

            <label>
              Preferred Language
              <input
                value={form.preferredLanguage}
                onChange={(event) => updateField("preferredLanguage", event.target.value)}
                placeholder="e.g. English / Urdu"
              />
            </label>

            <Fieldset legend="I Prefer To Set My Rate Based On">
              <RadioGroup
                name="rateType"
                options={["Hourly", "Daily", "Monthly"]}
                value={form.rateType}
                onChange={(value) => updateField("rateType", value)}
              />
            </Fieldset>

            <Fieldset legend="Preferred Days">
              <div className="quick-actions">
                {["Weekdays", "Weekends", "Flexible"].map((option) => (
                  <button type="button" key={option} onClick={() => selectDays(option)}>
                    {option}
                  </button>
                ))}
              </div>
              <div className="checkbox-grid">
                {DAYS.map((day) => (
                  <label className="inline-control" key={day}>
                    <input
                      type="checkbox"
                      checked={form.preferredDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
              <p className="helper">{selectedDaysLabel}</p>
            </Fieldset>

            <Fieldset legend="Preferred Time">
              <div className="slots">
                {form.timeSlots.map((slot, index) => (
                  <div className="slot" key={index}>
                    <label>
                      FROM
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(event) => updateSlot(index, "from", event.target.value)}
                      />
                    </label>
                    <label>
                      TO
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(event) => updateSlot(index, "to", event.target.value)}
                      />
                    </label>
                    {index > 0 && (
                      <button type="button" className="remove-button" onClick={() => removeSlot(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="secondary-button" onClick={addSlot}>
                + Add Another Time Slot
              </button>
            </Fieldset>

            <Fieldset legend="Classes Per Week">
              <div className="button-select">
                {["1", "2", "3", "4", "5+"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={form.classesPerWeek === option ? "selected" : ""}
                    onClick={() => updateField("classesPerWeek", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Fieldset>

            <label>
              Class / Grade
              <input
                value={form.classGrade}
                onChange={(event) => updateField("classGrade", event.target.value)}
                placeholder="e.g. Grade 10 / O-Level"
              />
            </label>

            <label>
              Subject / Course
              <input
                value={form.subjectCourse}
                onChange={(event) => updateField("subjectCourse", event.target.value)}
                placeholder="e.g. Physics, Chemistry, Mathematics"
              />
            </label>

            <label>
              Enter the subjects you need tutoring for
              <input
                value={form.subjects}
                onChange={(event) => updateField("subjects", event.target.value)}
                placeholder="e.g. Physics & Chemistry etc."
              />
            </label>

            <label>
              Preferred Tutor Gender
              <select
                value={form.preferredTutorGender}
                onChange={(event) => updateField("preferredTutorGender", event.target.value)}
              >
                {["Any", "Male", "Female"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Country
              <select value={form.country} onChange={(e) => updateField("country", e.target.value)}>
                {["Pakistan", "India", "United States", "United Kingdom", "Australia", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <Fieldset legend="I Prefer To Discuss My Rate">
              <RadioGroup
                name="ratePreference"
                options={["Negotiable", "Open to offers", "Fixed"]}
                value={form.ratePreference}
                onChange={(value) => updateField("ratePreference", value)}
              />
            </Fieldset>

            <label>
              Additional Information
              <textarea
                value={form.additionalInformation}
                onChange={(event) => updateField("additionalInformation", event.target.value)}
                placeholder="e.g. Female tutor only - Need first demo class..."
                maxLength={500}
              />
            </label>

            <label className="terms">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(event) => updateField("termsAccepted", event.target.checked)}
              />
              <span>
                I agree to the <a href="#">Terms and Conditions</a>
              </span>
            </label>

            {error && <p className="error">{error}</p>}
            {isLoading && <p className="status">{LOADING_MESSAGES[loadingMessageIndex]}</p>}

            <div className="ai-action">
              <button type="submit" className="ai-button" disabled={isLoading}>
                <span className="ai-spark" aria-hidden="true">AI</span>
                <span>{isLoading ? "Generating..." : "Ask AI for Price"}</span>
              </button>
            </div>

            {result && (
              <section className="ai-output" aria-live="polite">
                <div className="ai-output-header">
                  <span className="ai-output-icon" aria-hidden="true">AI</span>
                  <h2>AI Price Recommendation</h2>
                </div>
                <div className="ai-summary">
                  <p>Recommended</p>
                  <strong>
                    {result.currency} {Number(result.predictedPrice).toLocaleString()} / {result.rateType}
                  </strong>
                </div>
                <div className="ai-range">
                  <span>Estimated Range</span>
                  <p>
                    {result.currency} {Number(result.minimumPrice).toLocaleString()} - {result.currency}{" "}
                    {Number(result.maximumPrice).toLocaleString()}
                  </p>
                </div>
                <div className="ai-reason">
                  <span>Reason</span>
                  <p>{result.reason}</p>
                </div>
              </section>
            )}
          </form>
      </section>
    </main>
  );
}

function Fieldset({ legend, children }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="radio-group">
      {options.map((option) => (
        <label className="inline-control" key={option}>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={(event) => onChange(event.target.value)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

export default App;
