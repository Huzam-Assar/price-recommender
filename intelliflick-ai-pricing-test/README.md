# IntelliFlick AI Tuition Pricing Test

This is a standalone temporary testing application for an IntelliFlick AI Tuition Pricing feature. It is not connected to any existing IntelliFlick website.

The React frontend is intentionally simple. The Express backend is structured so the API, Gemini service, validation, and MongoDB model can later be copied into a real MERN application.

The country selector currently supports Pakistan, India, United States, United Kingdom, Australia, and Other. The backend maps those selections to PKR, INR, USD, GBP, AUD, and USD respectively, then validates that Gemini returns the matching currency code.

## Project Structure

```text
intelliflick-ai-pricing-test/
├── client/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── controllers/
│   │   └── tuitionController.js
│   ├── models/
│   │   └── TuitionAIRecommendation.js
│   ├── routes/
│   │   └── tuitionRoutes.js
│   ├── services/
│   │   └── geminiService.js
│   ├── tests/
│   │   └── validation.test.js
│   ├── utils/
│   │   ├── aiRecommendationValidation.js
│   │   └── tuitionValidation.js
│   ├── package.json
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Install Dependencies

From the project root:

```bash
npm install
npm run install:all
```

Or install each app separately:

```bash
cd server
npm install

cd ../client
npm install
```

## Configure Environment

Create `server/.env` from the root example values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
CLIENT_ORIGIN=http://localhost:5173
```

The Gemini API key is read only by the backend. Do not create a frontend Gemini key.

`GEMINI_MODEL` is optional. If the configured model is unavailable, the backend tries fallback text models automatically.

## Start MongoDB

Use a local MongoDB instance or a MongoDB Atlas connection string.

Local example:

```bash
mongod
```

Then set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/intelliflick_ai_pricing_test
```

## Start The Backend

```bash
cd server
npm run dev
```

The backend runs on `http://localhost:5000`.

## Start The Frontend

In a separate terminal:

```bash
cd client
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Test The Form

1. Open `http://localhost:5173`.
2. Fill in all required fields.
3. Accept the Terms and Conditions.
4. Click `Ask AI for Price`.
5. The React app sends the form to `POST /api/tuition/ai-recommend`.
6. The backend calls Gemini, validates the JSON response, stores the request and response in MongoDB, and returns the recommendation to React.

## API Endpoint

`POST http://localhost:5000/api/tuition/ai-recommend`

## Example API Request

```json
{
  "modeOfTuition": "Online",
  "country": "Pakistan",
  "preferredLanguage": "English",
  "rateType": "Monthly",
  "preferredDays": ["Monday", "Wednesday", "Friday"],
  "timeSlots": [
    {
      "from": "17:00",
      "to": "19:00"
    }
  ],
  "classesPerWeek": 3,
  "classGrade": "Grade 10",
  "subjectCourse": "Physics",
  "subjects": "Physics and Chemistry",
  "preferredTutorGender": "Any",
  "ratePreference": "Negotiable",
  "additionalInformation": "Need a demo class"
}
```

## Example API Response

```json
{
  "success": true,
  "data": {
    "predictedPrice": 22000,
    "minimumPrice": 18000,
    "maximumPrice": 26000,
    "currency": "PKR",
    "rateType": "Monthly",
    "confidence": "Medium",
    "reason": "The estimate considers the grade, subjects, tuition mode and weekly classes."
  }
}
```

Failure responses use this shape:

```json
{
  "success": false,
  "message": "Unable to generate an AI price recommendation."
}
```

## Notes For Future Integration

- The real IntelliFlick website only needs to call `POST /api/tuition/ai-recommend` with the same form data shape.
- Gemini is called only from `server/services/geminiService.js`.
- MongoDB stores only the test request and AI response. It is not used for historical pricing lookup.
- Gemini is instructed not to claim historical IntelliFlick pricing data or real-time market data.
