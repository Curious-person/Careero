# 🧠 Careero Matching Engine Documentation

## 📌 Overview
The **Careero Matching Engine** is the core system that determines whether a student qualifies for a specific internship role. It automates evaluation using a combination of **rule-based logic**, **AI-powered skill matching**, and **verified proof systems**.

Instead of manual screening, companies rely on Careero to objectively assess, rank, and validate candidates based on real-world activity.

---

## 🏗️ System Architecture

The matching system is composed of three main components:

### 🔵 1. Requirement Engine (Company Side)
Defines the criteria for an internship role via a **rule set**.
- **Required Skills:** Technical stack needed.
- **Minimum Points:** Experience threshold.
- **Required Events:** Mandatory milestones (e.g., Hackathons).
- **Minimum Readiness Score:** Soft skill/professionalism floor.

### 🟣 2. Student Profile Engine
Represents the student’s qualifications and progress.
- Extracted and validated skills.
- Accumulated points and completed events.
- Dynamic readiness score.

### 🟢 3. Matching Engine
The processing layer that evaluates profiles against requirements using a hybrid approach of rule-validation and semantic AI.

---

## ⚙️ Eligibility Logic

The engine determines "Eligible" status through a four-step sequential gate:

| Step | Check | Logic |
| :--- | :--- | :--- |
| **1** | **Points** | `student.points >= company.minimumPoints` |
| **2** | **Events** | `requiredEvents ⊆ student.completedEvents` |
| **3** | **Skills** | AI Semantic Similarity (Threshold $\ge 0.75$) |
| **4** | **Readiness** | `student.readinessScore >= minimumReadinessScore` |

> **Final Decision:** If **ALL** conditions are met, status is set to `Eligible`. Otherwise, status is `Not Eligible`.

---

## 📊 Match Score Calculation

Beyond basic eligibility, Careero computes a **Match Score** to rank candidates using the following weighted formula:

$$Score = (40\%) \text{ Skill Match} + (30\%) \text{ Points} + (20\%) \text{ Events} + (10\%) \text{ Activity}$$

### Example Output:
**Candidate:** Lark Babao  
**Total Match Score:** `89%`
- ✔ **Skills:** 92%
- ✔ **Points:** 100%
- ⚠ **Events:** 80%
- ✔ **Readiness:** 85%

---

## 🔐 Proof Verification System

To ensure authenticity and eliminate "resume padding," achievements must be verified:

* **🎯 Events:** Verified via QR-based attendance and system logs.
* **💻 Projects:** Verified via GitHub API analysis (Commit frequency, repo usage).
* **📜 Certifications:** Verified via OCR + AI validation and school-level confirmation.

### 🤖 AI Skill Validation
The system assigns a **Skill Confidence Score** to every claim. For example, if a student claims "React," the system verifies:
1.  **Repository Usage:** How many projects use this library?
2.  **Commit Frequency:** Is the student actively coding in this language?
3.  **Project Relevance:** Is the implementation significant?

**Result:** `React: 85% Confidence` | `Node.js: 92% Confidence`

---

## 🚀 Key Innovation
Careero does not simply match students to internships—it **verifies their readiness** using AI, real-time activity data, and a transparent, objective scoring system.

---

## 🏁 Summary Flow
1. **Define:** Company sets requirements.
2. **Evaluate:** Careero fetches student profiles.
3. **Analyze:** AI performs semantic skill matching.
4. **Verify:** System validates proofs of achievements.
5. **Rank:** Match score is computed and candidates are displayed on the Dashboard.