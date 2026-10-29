# MindPulse — Mental Health Risk Assessment & Clinical Decision Support (CDS)

MindPulse is a clinical decision-support interface built with React 19, TypeScript, and Tailwind CSS. It is engineered to integrate seamlessly with machine learning risk-classification backends (FastAPI, Flask, or PyTorch inference pipelines) while strictly upholding psychiatric screening ethics, explainability, accessibility, and privacy standards.

---

## 🌟 Key Capabilities & Requirements Compliance

### 1. Risk Classification
- **Three Validated Categories:** `Low Risk`, `Medium Risk`, and `High Risk` with distinct WCAG AA/AAA accessible colors (Emerald, Warm Amber, Deep Crimson).
- **No Arbitrary Scoring:** Numerical risk scores are displayed **only** when provided by a validated psychometric instrument (e.g., standard PHQ-9 0–27 scale) or a calibrated scoring method. If uncalibrated or omitted by the model, numerical scores are suppressed.
- **Separate Model Confidence:** Model certainty (calibrated statistical probability) is clearly segregated from the clinical severity risk score and uncertainty dispersion ($\pm \sigma$) is reported.
- **Predefined Thresholds:** Risk thresholds are established during model validation, not arbitrarily invented in the frontend.

### 2. Assessment Input
- **Standardized Multi-Item Screening:** Validated Patient Health Questionnaire (PHQ-9 items 1–9) with standard Likert response scales (0 to 3), domain tagging, and real-time completion tracking.
- **Contextual Journaling (Free Text):** Multi-line reflections supporting NLP feature extraction (affective sentiment and semantic embeddings).
- **Modular Behavioral Inputs:** Sleep hours, physical activity level, weekly social interaction hours, and leisure screen time — included only when mapped to model feature schemas.
- **Modular Audio Analysis:** Voice reflection recorder and audio file uploader (.wav/.mp3), active only when acoustic feature extraction is enabled on the model.
- **Input Validation:** Detailed field-level error messages and automatic focus scrolling for missed required screening items.

### 3. Results Dashboard
- Prominently labeled risk cards displaying predicted category (`Low Risk`, `Medium Risk`, or `High Risk`).
- Validated numerical score with psychometric source attribution.
- Separate calibrated model confidence gauge.
- **Explainable Feature Attributions (SHAP):** Visual indicators displaying protective factors, moderate drivers, and high-impact distress markers with weights and clinical descriptions.
- Assessment timestamp, reference ID, and complete submitted feature breakdown.
- Contextual next-step recommendations and printable clinical summary report.

### 4. Decision-Support Guidance & Safety Protocols
- **Low Risk:** General wellbeing, circadian rhythm sleep hygiene, micro-mindfulness, and preventive routine check-ins.
- **Medium Risk:** Consultation recommendations with licensed clinicians (LCSW, LPC, psychologist, primary care), appointment preparation checklists, and non-crisis peer warmlines.
- **High Risk:** Prompt professional evaluation warnings, direct access to emergency services, and crisis safety action plans.
- **Immediate Crisis Safeguards:** Dedicated 24/7 Lifeline modal (Call/Text **988**, Crisis Text Line **741741**, International Lifelines) permanently accessible from the header and triggered automatically if suicidal ideation (PHQ-9 item 9 or danger keywords) is detected.
- **Clinical Non-Diagnostic Disclaimer:** Explicit notice that predictions are probabilistic decision aids and do not constitute formal diagnoses or guarantees of safety.

### 5. Model Integration & API Contracts
- Typed service layer (`src/services/api.ts`) ready for FastAPI or Flask.
- Standardized request/response interfaces: `POST /api/predict`, `GET /api/model-info`, `GET /api/health`.
- Interactive API contract inspector with real-time ping latency check and service-unavailable states.
- **Clearly Labeled Mock Mode:** High-visibility banner when running in synthetic frontend mock mode; mock data is never misrepresented as authentic clinical inference.

### 6. Privacy & Data Governance
- **Zero Third-Party Telemetry:** No cookies, trackers, or commercial surveillance.
- **Deliberate Opt-In Persistence:** Longitudinal history is stored purely in client-side browser storage only when explicitly enabled by the user. When disabled, assessments exist solely in volatile tab memory.
- **Data Portability:** Single-click JSON data export and permanent history purge controls.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Run the Frontend (Vite + React)
```bash
# Navigate to the project directory
cd mental-health-assessment

# Start the Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run the Python Backend (Optional)

You can run either the zero-dependency standard-library backend or the FastAPI production backend:

#### Option A: Zero-Dependency Python Server (Runs immediately)
```bash
python backend/simple_server.py
```

#### Option B: FastAPI / Uvicorn Server
```bash
pip install fastapi uvicorn pydantic
python backend/server.py
```
The backend listens on `http://127.0.0.1:8000`.

---

## 🧪 Testing the Risk Profiles

Use the **Quick Test Profiles** buttons at the top of the Assessment form:
- **Low Risk:** Pre-fills optimal sleep, zero distress items, positive journal text.
- **Medium Risk:** Pre-fills moderate fatigue, intermittent sleep disruption, work stress notes.
- **High Risk:** Pre-fills elevated scores, reduced sleep, and prompts the immediate safety lifeline.
