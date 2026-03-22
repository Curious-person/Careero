# Accumulations API Documentation

## Overview

The accumulations API now supports both **school** and **company** user types with proper role-based access control. The distinction between school and company accumulations is enforced through:

1. **Route-level authorization** - Middleware checks user roles
2. **Source verification** - `source` field in database
3. **Creator tracking** - `createdBy` field hardcoded as 'school' or 'company'

---

## Endpoint Structure

### Shared Endpoints (Accessible by both school and company)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/accumulations` | Get all accumulations (optional `?source=school|company` filter) |
| `GET` | `/api/v1/accumulations/:id` | Get a single accumulation by ID |

---

### School-Specific Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/accumulations/school/my` | Get all accumulations created by school | `school` |
| `POST` | `/api/v1/accumulations/school` | Create a new school accumulation | `school` |
| `PATCH` | `/api/v1/accumulations/school/:id/end` | End a school accumulation | `school` |
| `POST` | `/api/v1/accumulations/school/:id/grade` | Grade a participant | `school` |
| `DELETE` | `/api/v1/accumulations/school/:id` | Delete a school accumulation | `school` |

---

### Company-Specific Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/accumulations/company/my` | Get all accumulations created by company | `company` |
| `POST` | `/api/v1/accumulations/company` | Create a new company accumulation | `company` |
| `PATCH` | `/api/v1/accumulations/company/:id/end` | End a company accumulation | `company` |
| `POST` | `/api/v1/accumulations/company/:id/grade` | Grade a participant | `company` |
| `DELETE` | `/api/v1/accumulations/company/:id` | Delete a company accumulation | `company` |

---

## Request/Response Examples

### Create Company Accumulation

**Request:**
```http
POST /api/v1/accumulations/company
Content-Type: application/json
Cookie: jwt=<token>
```

```json
{
  "title": "Summer Internship Challenge",
  "type": "Challenge",
  "courses": ["Computer Science", "Information Technology"],
  "deadline": "2026-08-31",
  "duration": "3 months",
  "points": 100,
  "description": "A challenging internship program for students",
  "skillTags": ["#webdev", "#softwaredev"],
  "challenges": [
    {
      "title": "Build a Web App",
      "description": "Create a full-stack web application"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Accumulation created successfully",
  "data": {
    "_id": "...",
    "title": "Summer Internship Challenge",
    "source": "company",
    "createdBy": "company",
    ...
  }
}
```

---

## Key Implementation Details

### 1. Database Schema
```typescript
{
  source: 'school' | 'company',      // Distinguishes accumulation type
  createdBy: 'school' | 'company',   // Hardcoded creator identifier
}
```

### 2. Authorization Flow
```
Request → authenticateToken → authorizeRoles('school'|'company') → Handler
```

### 3. Service-Level Verification
Operations like `endAccumulation` and `deleteAccumulation` verify ownership:
```typescript
if (accum.source !== source) {
  throw new Error(`Only ${source} accumulations can be ended by ${source}`);
}
```

---

## Frontend Usage

### Company Accumulations

```typescript
import {
  getMyCompanyAccumulations,
  createCompanyAccumulation,
  endCompanyAccumulation,
  deleteCompanyAccumulation,
} from '@/lib/accumulationsApi';

// Get all company accumulations
const { data } = await getMyCompanyAccumulations();

// Create new accumulation
const newAccum = await createCompanyAccumulation({
  title: 'Hackathon 2026',
  type: 'Challenge',
  courses: ['CS'],
  deadline: '2026-12-31',
  duration: '2 weeks',
  points: 500,
  description: 'Annual hackathon',
  challenges: [...]
});

// End accumulation
await endCompanyAccumulation(accumId);

// Delete accumulation
await deleteCompanyAccumulation(accumId);
```

### School Accumulations

```typescript
import {
  getMySchoolAccumulations,
  createSchoolAccumulation,
  endSchoolAccumulation,
  gradeSchoolParticipant,
} from '@/lib/accumulationsApi';

// Similar API for school operations
const { data } = await getMySchoolAccumulations();
```

---

## Security

- All endpoints require authentication via JWT token (HttpOnly cookie)
- Role-based access control enforced at route level
- Service layer validates ownership for write operations
- 401 Unauthorized: No token or invalid token
- 403 Forbidden: Valid token but insufficient role permissions
