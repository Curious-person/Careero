# CAREERO: Verify Your Skills. AI-Match Your Future.

Careero is an AI-powered skill verification and career matching platform designed to solve the **"Verification Gap"**—the disconnect between a student's self-proclaimed skills and an employer's need for verified competence.

By integrating Students, Schools, and Industry partners into a single "Skill Accumulation" ecosystem, Careero transforms the traditional job search into a data-driven journey of verified growth.

---

## 🌟 Key Features

### 🎓 For Students
*   **Calculated Skill Graph**: An interactive 6-node radar chart (Logic, Proficiency, Consistency, etc.) derived from verified academic and industrial data.
*   **Smart Career Roadmap**: AI-generated career paths that adapt in real-time as you complete new milestones.
*   **Verified Artifact Log**: A portfolio of certifications validated by AI (OCR + Gemini) and audited by school administrators.
*   **Eligibility Gait**: Real-time matching against industry roles with a clear breakdown of "Matched Skills" vs "Missing Skills."

### 🏢 For Companies
*   **Talent Potential Scoring**: A ranked feed of students filtered by AI match potential and engagement levels.
*   **Role-Specific Gaits**: Create roles with mandatory prerequisite "Accumulations" (Tasks/Challenges) to ensure pre-verified competency.
*   **AI Screening**: automated screening using local semantic similarity models to rank applicants objectively.

### 🏫 For Schools
*   **Institutional Overview**: Analytics on academic performance and industry readiness across different departments.
*   **Administrative Audit**: A master dashboard to verify student identities and validate AI-processed certifications.
*   **Grading Engine**: A rubric-based evaluation system to award skill points for school-sanctioned projects.

---

## ⚡ Technical Core

-   **Matching Engine**: Powered by **Transformers.js** for local, privacy-safe semantic similarity matching on the client and server.
-   **Verification Intelligence**: Uses **Tesseract.js OCR** and **Google Gemini AI** to extract and validate certificate metadata automatically.
-   **Security**: Robust Authentication using **JWT and HTTP-Only cookies** with role-based access control (RBAC).
-   **Architecture**: Monorepo structure with a Next.js 14 frontend and a Node.js/Express.js backend.

---

## 🌍 SDG Alignment

Careero is built with global impact in mind:
*   **SDG 4 (Quality Education)**: Standardizing skill verification across institutions.
*   **SDG 8 (Decent Work)**: Directing verified talent toward the most compatible industry roles.
*   **SDG 9 (Innovation)**: Building the infrastructure for the future of skill-based hiring.

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Recharts.
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose).
*   **AI Tier**: Transformers.js, Google Generative AI (Gemini Flash).
*   **UI Components**: shadcn/ui, Lucide React.

---

## 🚀 Quick Start

### 1. Installation
Install dependencies for the entire monorepo:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in `apps/api/` and `apps/web/` based on their respective `.env.example` files (ensure `MONGO_URI` and `GEMINI_API_KEY` are provided).

### 3. Run Development Servers
Start both the Frontend and Backend concurrently:
```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
apps/
├── api/             # Express.js API backend (Logic, AI Matching, Persistence)
└── web/             # Next.js App Router frontend (UI, Interactive Graphs, Onboarding)
```

For more detailed technical specifications, see [CAREERO_DOCUMENTATION.md](./CAREERO_DOCUMENTATION.md).
