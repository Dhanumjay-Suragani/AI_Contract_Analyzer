# 📄 AI Contract Analyzer

## 🚀 Overview

AI Contract Analyzer is a full-stack web application designed to streamline contract review by leveraging AI-powered analysis.

It enables users to upload contracts (PDF/TXT), extract text, and generate structured, actionable insights such as summaries, clauses, deadlines, obligations, and risk indicators. Additionally, it provides a context-aware chat interface for querying contract details.

**Problem Solved:**
Manual contract analysis is time-consuming and error-prone. This system accelerates understanding while reducing risk exposure.

**Target Users:**

* Legal Operations Teams
* Founders & Startups
* Procurement Teams
* Sales Operations
* Contract Review Professionals

**Workflow:**
Upload → Analyze → Dashboard → Ask Questions

---

## ✨ Key Features

* 📂 **Contract Upload (PDF/TXT)**
  Supports file upload with automatic text extraction.

* 🤖 **AI-Powered Analysis**
  Uses Google Gemini to generate structured insights:

  * Summary
  * Clauses
  * Risks
  * Deadlines
  * Obligations
  * Confidence Score

* ⚡ **Heuristic Risk Scoring**
  Fast, deterministic keyword-based risk analysis with explanations.

* 📊 **Interactive Dashboard**
  Visualizes contract insights using charts and structured views.

* 💬 **Contract Q&A Chat**
  Ask contextual questions based on contract content.

* 🔐 **Authentication & History (Optional)**
  Firebase Authentication + Firestore-based history tracking.

---

## 🏗️ Architecture

### High-Level Design

* **Frontend:** React-based UI with session state management
* **Backend:** Express API for processing and AI interaction
* **Database (Optional):** Firebase Firestore

### Request Flow

1. User uploads contract
2. Backend extracts text (`/upload`)
3. Text sent for AI analysis (`/analyze`)
4. Backend:

   * Calls Gemini API
   * Computes heuristic risk score
5. Frontend displays results in dashboard
6. Optional: Data stored in Firestore

### Scalability Considerations

* Stateless backend → horizontally scalable
* Handles up to ~120k characters per request
* Uses in-memory file handling (production upgrade recommended)
* No rate limiting (should be added for production)

---

## 🧰 Tech Stack

### Frontend

* React 19 + TypeScript
* Vite
* React Router
* Tailwind CSS
* Radix UI
* framer-motion
* recharts

### Backend

* Node.js (≥18)
* Express
* Multer
* pdf-parse
* dotenv, cors
* @google/generative-ai

### Database

* Firebase Firestore (optional)

### DevOps / Deployment

* Not implemented
* Recommended:

  * Frontend → Vercel / Netlify
  * Backend → Render / Fly.io / Google Cloud Run

### Integrations

* Google Gemini AI
* Firebase Authentication

---

## 📁 Folder Structure

```
ai-contract-analyzer/
├─ backend/
│  ├─ routes/
│  │  ├─ analyze.js
│  │  ├─ chat.js
│  │  └─ upload.js
│  ├─ services/
│  │  ├─ geminiService.js
│  │  └─ parser.js
│  ├─ utils/
│  │  └─ riskCalculator.js
│  ├─ server.js
│  └─ package.json
├─ public/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  ├─ pages/
│  ├─ main.tsx
│  └─ App.tsx
├─ .env.example
├─ package.json
└─ vite.config.ts
```

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js 18+
* npm

### 1. Clone Repository

```
git clone https://github.com/Dhanumjay-Suragani/AI_Contract_Analyzer.git
cd AI_Contract_Analyzer/ai-contract-analyzer
```

### 2. Install Dependencies

```
npm install
cd backend
npm install
```

### 3. Environment Variables

#### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

#### Backend (.env)

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=
PORT=5000
```

---

## ▶️ Usage

### Run Backend

```
cd backend
npm run dev
```

### Run Frontend

```
npm run dev
```

### Workflow

1. Upload contract
2. View analysis dashboard
3. Ask questions via chat
4. Access history (if enabled)

---

## 📡 API Documentation

### Health Check

```
GET /health
```

### Upload Contract

```
POST /upload
```

### Analyze Contract

```
POST /analyze
```

### Chat with Contract

```
POST /chat
```

---

## 🗄️ Database Schema (Firestore - Optional)

* **analyses**
* **contracts**
* **users**

Stores:

* Extracted text
* Analysis results
* Metadata

---

## 🔧 Configuration

* API base URL via `VITE_API_URL`
* Firebase integration optional
* CORS configurable via backend

---

## 🚀 Deployment

Not implemented.

### Recommended Setup:

* Frontend → Vercel
* Backend → Render / Fly.io
* Storage → AWS S3 / GCP Storage

---

## ⚡ Performance & Optimization

* Stateless API design
* Heuristic + AI hybrid scoring
* Needs:

  * Rate limiting
  * Caching
  * Chunked processing for large files

---

## 🔐 Security Considerations

* Firebase Authentication (optional)
* No rate limiting implemented
* Sensitive API keys must be secured

---

## 🧪 Testing

Not implemented.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request

---

## 📜 License

MIT License (recommended if not defined)

---

## 🔮 Future Improvements

* Rate limiting & API security
* Large file streaming support
* Multi-language contract support
* Advanced clause classification
* Role-based access control
* CI/CD pipeline integration

---


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```






