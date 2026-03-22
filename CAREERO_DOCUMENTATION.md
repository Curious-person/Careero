# Careero: Granular Technical System Documentation

## 1. System Overview
Careero is a career development infrastructure that validates professional competence through a **Verified Proof** system. It bridges the gap between academic learning and industry entry by replacing self-reported resumes with data-backed profiles.

---

## 2. Dashboard Architecture (Frontend: Next.js)

### A. Student Dashboard (`/dashboard/student`)
Focuses on skill verification and career discovery.
*   **Overview (`/`)**: Displays the **Dynamic Skill Graph**, recently earned points, and active roadmaps.
*   **Accumulations (`/accumulations`)**: Interface for discovering and joining school/company tasks.
*   **Internship Offers (`/offers`)**: List of roles where the student meets the **AI-Eligibility** criteria. 
*   **Onboarding (`/onboarding`)**: Collects initial academic and skill metadata used for first-run matching.
*   **Profile (`/profile`)**: Detailed view of academic records, certifications, and the calculated skill radar.

### B. Company Dashboard (`/dashboard/company`)
Focuses on talent acquisition and task management.
*   **Role Management (`/roles`)**: Companies define technical requirements, point thresholds, and mandatory milestones.
*   **AI Applicant Screening (`/applicants`)**: View of candidates ranked by their **Match Score** (weighted AI).
*   **Task Hosting (`/accumulations`)**: Creation of industry-specific challenges or internship prerequisites.
*   **Settings/Team**: Configuration of company branding and recruiter access levels.

### C. School Dashboard (`/dashboard/school`)
Focuses on administrative oversight and verification authority.
*   **Student Auditing (`/students`)**: Full visibility into student progress and accumulation history.
*   **Verification Control (`/accumulations`)**: Management of school-sanctioned events and courses.
*   **Partner Management (`/company`)**: Oversight of participating industry entities.

---

## 3. Backend Architecture (Express & Node.js)

### A. The Service-Controller Pattern
Careero follows a modular architecture where **Controllers** handle HTTP concerns and **Services** execute business logic.

| Module | Route Path | Controller | Primary Service |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth` | `auth.controller` | `auth.service` |
| **Student** | `/profile` | `profile.controller` | `profile.service` |
| **Company** | `/company` | `companyProfile.controller` | `profile.service` |
| **Logic** | `/roles` | `role.controller` | `careero.service` (AI) |
| **Proof** | `/accumulations`| `accumulation.controller` | `accumulation.service` |
| **Email** | N/A | N/A | `email.service` (Nodemailer) |

### B. Authentication & Security
*   **Protocol**: JWT (JSON Web Token) with RS256/HS256 encryption.
*   **Storage**: **HTTP-Only Cookies** (`jwt`) to prevent XSS-based token theft.
*   **Device Trust**: A secondary `deviceToken` cookie persists for 7 days to enable OTP-less login on recognized machines.
*   **Middleware**: `auth.middleware.ts` validates tokens on every request and populates the `req.user` object for role-based authorization.

### C. State & Persistence
*   **Database**: MongoDB (NoSQL) for flexible student/company metadata.
*   **ODM**: Mongoose for schema enforcement and validation.
*   **Frontend State**: Component-level React `useState` and `useEffect`.
*   **API Client**: Axios instance (`apiClient.ts`) with `withCredentials: true` to handle automatic cookie transmission between the browser and API.

---

## 4. Implementation Details: Features & Logic

### I. The "Proof of Work" (Accumulations)
*   **Flow**: Admin creates Task -> Student Joins -> Completion Event -> Admin Grades -> Points Awarded.
*   **Logic**: Points are assigned to specific sub-categories (Academic, Hard Skills, Soft Skills) based on the task's metadata.

### II. AI Matching Engine (`careero.service.ts`)
*   **Library**: `Transformers.js` (HuggingFace) using the `all-MiniLM-L6-v2` model.
*   **Process**:
    1.  Convert Skill Tags (Student) and Requirements (Role) into 384-dimensional vectors.
    2.  Calculate **Cosine Similarity** between vectors.
    3.  Apply weights: **40% Skill**, **30% Points**, **20% Events**, **10% Readiness**.
*   **Privacy**: Matching runs locally where possible to ensure skill-vector data is processed efficiently.

### III. Verification Systems (OCR & Vision)
*   **OCR**: `Tesseract.js` Extracts raw text from uploaded certificates.
*   **NLP Validation**: **Google Gemini Pro** analyzes the extracted text to confirm the date, issuer, and skill relevance, assigning a **Confidence Score** to the tag.

---

## 5. Global Impact (SDG)
*   **SDG 4 (Quality Education)**: Bridges the skills gap by aligning curriculum with industry data.
*   **SDG 8 (Decent Work)**: Promotes merit-based hiring as any student can prove their worth regardless of pedigree.
*   **SDG 9 (Innovation)**: Leverages edge AI to update recruitment infrastructure.
