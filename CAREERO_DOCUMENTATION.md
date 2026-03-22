# CAREERO: Technical System Documentation

Careero is an AI-powered skill verification and career matching platform designed to bridge the gap between academic learning and industry requirements. This document provides a granular breakdown of the system architecture, feature sets for each user role, and technical implementations.

---

## 1. System Vision & SDG Alignment

Careero is built to solve the "Verification Gap"—the disconnect between a student's self-proclaimed skills and an employer's need for verified competence.

*   **SDG 4: Quality Education**: Provides students with a "Smart Career Roadmap" that adapts to their academic performance.
*   **SDG 8: Decent Work and Economic Growth**: Automates the matching of verified talents to industry roles through an AI-powered "Eligibility Gait."
*   **SDG 9: Industry, Innovation, and Infrastructure**: Implements a novel "Accumulation" system that treats local tasks and industry challenges as verified skill data points.

---

## 2. Shared Infrastructure & Security

### Authentication & Authorization
*   **JWT & HTTP-Only Cookies**: Secure session management using `jwt` and `deviceToken` cookies.
*   **Role-Based Access Control (RBAC)**: Middleware-enforced boundaries between Student, Company, and School domains.
*   **Device Fingerprinting**: Tracking sessions via `deviceToken` to ensure account integrity.

### State Management & Persistence
*   **Frontend**: React Hooks (useState/useEffect) with Axios (`withCredentials: true`) for secure API communication.
*   **Backend**: Node.js/Express.js with MongoDB (Mongoose) for document-based persistence.
*   **Email Service**: Nodemailer integration for OTP and system notifications.

---

## 3. Student Features: Skill Growth & Matching

### Dashboard (Overview)
*   **KPI Tracking**: Real-time display of Total Skill Points, Unlocked Offers, Active Accumulations, and Verified Artifacts.
*   **Calculated Skill Graph**: An interactive 6-node radar chart (Logic, Proficiency, Consistency, etc.) derived from verified data.
*   **Quick Access**: Lateral navigation to top-matched industry offers and current tasks.

### My Profile (The Digital Resume)
*   **Academic Transcript**: Visualized GPA and subject-wise performance (verified by the school).
*   **Smart Career Roadmap**: An AI-generated path with milestones. Features a "Regenerate" button for real-time AI adjustments based on new achievements.
*   **Verified Certifications**: Log of certificates processed via **Tesseract.js OCR** and validated by the **Google Gemini API**. Displays confidence scores and extracted metadata.
*   **AI Resume Builder**: Generates a professional markdown/PDF resume using verified platform data (Academic records + Completed Accumulations).
*   **Verification Status**: Visual banner indicating if the account is "Under Evaluation" or "Verified."

### Accumulations (The Work Bench)
*   **Tabbed Workflow**: Filterable view for Available, In Progress, and Completed tasks.
*   **Task Execution View**:
    *   **Checklist Engine**: Interactive modules/tasks that must be ticked to progress.
    *   **Live Countdown**: Ticking timer for task deadlines.
    *   **Completion Gait**: Success button unlocks only when the internal checklist and AI-checks (if applicable) are satisfied.

### Offers (The AI Matchmaker)
*   **Match Ranking**: Industry roles sorted by **Transformers.js** semantic similarity score.
*   **Eligibility Gait**: A visual breakdown of why a student is or isn't qualified.
    *   **Matched Skills**: Highlighted in Green.
    *   **Missing Skills**: Highlighted in Gray.
    *   **Blockers List**: Explicit list of missing requirements (e.g., "Missing JavaScript (Proficiency)").
    *   **Resolving Requirements**: Direct links to accumulations that will fix the "Missing Skills."

---

## 4. Company Features: Talent Scouting & Role Fulfillment

### Company Dashboard
*   **Talent Potential Feed**: List of "Connected Students" ranked by their potential % and engagement levels.
*   **Activity Feed**: Real-time log of when connected students earn certifications or complete relevant tasks.
*   **Quick Stats**: Ready-to-hire count, average match potential, and engagement metrics.

### Team & Roles (Role Architecture)
*   **Role Creation**:
    *   **Skill Tagging**: Definition of mandatory skill tags (up to 10) required for the position.
    *   **Linked Accumulations**: Companies must link at least one specific "Accumulation" (Task/Challenge) as a prerequisite for the role.
*   **Role Analytics**: Tracking filled vs. open slots with a visual progress bar.

### Applicants (Interview Management)
*   **AI Screening**: Initial list of applicants ranked by Careero Match Score.
*   **Interview Scheduler**: Integrated tool for Video, Phone, or In-person interviews with calendar selection.
*   **Meeting Engine**: Status-aware "Enter Meeting" buttons that activate only at the scheduled time.

### Accumulations (Industry Challenges)
*   **Hosting Engine**: Interface to create company-branded tasks or internship challenges.
*   **Participant Tracking**: Ability to manually add/remove students or grade their submissions.

---

## 5. School Features: Administrative Audit & Grading

### School Dashboard
*   **Institutional Overview**: Academic performance averages across different departments (IT, CS, Business).
*   **Field Performance**: Visual breakdown of which professional fields students are excelling in.

### Students Management (Quality Control)
*   **Student Audit**: Searchable directory of all enrolled students.
*   **Certification Verification**: Admin interface to review student-uploaded certificates and the AI-confidence report.
*   **Verification Toggle**: The "Master Switch" to officially verify student identities and profiles for the industry floor.

### Accumulations & Grading (The Validation Engine)
*   **School-Led Tasks**: Create internal accumulations (e.g., Senior Projects, Lab Tasks).
*   **Skill Grading Rubric**:
    *   Admins manually grade participant submissions.
    *   **Skill-Specific Scoring**: Assigning 1-10 scores to specific skill tags (e.g., "Logic: 8/10").
    *   **Feedback Persistence**: Detailed reviewer feedback is saved and becomes part of the student's verified record.

---

## 6. AI Matching & Verification Logic

### The Careero Matching Engine (`careero.service.ts`)
*   **Semantic Matching**: Uses **Transformers.js** to run local embedding models, comparing student skill tags against role requirements.
*   **Weighted Scoring Model**:
    *   **Skill Match (50%)**: Comparison of skill vector similarity.
    *   **Points Match (20%)**: Total points earned in relevant categories.
    *   **Events/Accumulations (20%)**: Completion of specific mandatory prerequisites.
    *   **Readiness (10%)**: Engagement frequency and profile completeness.

### OCR & Certificate Validation
*   **Tesseract.js**: Extracts raw text from uploaded images.
*   **Gemini AI**: Parses raw text to identify:
    1.  Issuing Organization.
    2.  Certificate Title.
    3.  Expiry Date.
    4.  Skill Relevance (Alignment with system Skill Tags).
*   **Confidence Scoring**: Automatically flags "Low Confidence" uploads for manual school administrator review.

---

## 7. Technical Environment
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide React, Recharts.
*   **Backend**: Node.js, Express.js, Mongoose/MongoDB.
*   **AI Tier**: Transformers.js (Local Inference), Google Generative AI (Gemini Flash).
*   **Infrastructure**: Axios with Cookie-based auth, Nodemailer for secure SMTP.

Careero transforms the job search from a game of "Keyword Stuffing" to a verified "Skill Accumulation" journey.
