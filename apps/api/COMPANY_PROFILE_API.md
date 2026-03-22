# Company Profile API Documentation

## Overview

The Company Profile API allows companies to manage their profile information and target student preferences. This includes company details, contact information, logo, and the fields/skills of students they're interested in recruiting.

---

## Base URL

```
http://localhost:5001/api/v1/company
```

All endpoints require authentication via JWT token in cookies.

---

## Endpoints

### 1. Get Company Profile

**GET** `/profile`

Retrieve the company profile for the authenticated user.

**Response:**
```json
{
  "message": "Company profile retrieved successfully",
  "profile": {
    "_id": "...",
    "user": "...",
    "name": "TechCorp Solutions",
    "industry": "Technology",
    "size": "50-200 employees",
    "founded": "2015",
    "description": "We are a leading technology company...",
    "logo": "data:image/png;base64,...",
    "website": "https://www.techcorp.com",
    "email": "contact@techcorp.com",
    "phone": "+1 (555) 123-4567",
    "address": "123 Business Ave, Tech City, TC 12345",
    "targetStudents": [
      {
        "_id": "...",
        "field": "Computer Science",
        "level": "Bachelor's",
        "skills": ["JavaScript", "React", "Node.js"]
      }
    ],
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-22T00:00:00.000Z"
  }
}
```

---

### 2. Create/Update Company Profile

**PUT** `/profile`

Create a new company profile or update an existing one.

**Request Body:**
```json
{
  "name": "TechCorp Solutions",
  "industry": "Technology",
  "size": "50-200 employees",
  "founded": "2015",
  "description": "We are a leading technology company...",
  "logo": "data:image/png;base64,...",
  "website": "https://www.techcorp.com",
  "email": "contact@techcorp.com",
  "phone": "+1 (555) 123-4567",
  "address": "123 Business Ave, Tech City, TC 12345",
  "targetStudents": [
    {
      "field": "Computer Science",
      "level": "Bachelor's",
      "skills": ["JavaScript", "React"]
    }
  ]
}
```

**Required Fields:**
- `name`
- `industry`
- `size`
- `founded`
- `description`
- `email`

**Response:**
```json
{
  "message": "Company profile saved successfully",
  "profile": { ... }
}
```

---

### 3. Update Company Logo

**PATCH** `/profile/logo`

Update only the company logo.

**Request Body:**
```json
{
  "logo": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "message": "Company logo updated successfully",
  "profile": { ... }
}
```

---

### 4. Add Target Student Preference

**POST** `/profile/target-students`

Add a new target student preference.

**Request Body:**
```json
{
  "field": "Computer Science",
  "level": "Bachelor's",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Required Fields:**
- `field`
- `level`

**Optional Fields:**
- `skills` (array, max 20)

**Response:**
```json
{
  "message": "Target student preference added successfully",
  "profile": { ... }
}
```

---

### 5. Remove Target Student Preference

**DELETE** `/profile/target-students/:id`

Remove a target student preference by ID.

**Parameters:**
- `id` - The MongoDB ObjectId of the target student preference

**Response:**
```json
{
  "message": "Target student preference removed successfully",
  "profile": { ... }
}
```

---

### 6. Get Profile Completeness Score

**GET** `/profile/completeness`

Get the company profile completeness score (0-100).

**Response:**
```json
{
  "message": "Profile completeness calculated successfully",
  "completenessScore": 85,
  "profile": {
    "name": "TechCorp Solutions",
    "industry": "Technology",
    "size": "50-200 employees",
    "hasLogo": true,
    "hasDescription": true,
    "targetStudentsCount": 3,
    "hasContactInfo": true,
    "hasWebsite": true
  }
}
```

**Scoring Breakdown:**
- Basic Info (40 points): name, industry, size, founded
- Contact Info (30 points): email, phone, website
- Profile Content (30 points): description length, logo, target students

---

## Data Models

### Company Profile Schema

```typescript
{
  user: ObjectId;              // Reference to User model
  name: string;                // 2-100 chars
  industry: string;            // 2-100 chars
  size: string;                // Enum: "1-10", "10-50", "50-200", "200-500", "500-1000", "1000+"
  founded: string;             // 4-digit year
  description: string;         // 20-2000 chars
  logo?: string;               // Base64 or URL
  website?: string;            // Valid URL
  email: string;               // Valid email
  phone?: string;
  address?: string;            // Max 200 chars
  targetStudents: [            // Max 10 items
    {
      field: string;           // 2-100 chars
      level: string;           // Enum: "High School", "Vocational", "Bachelor's", "Master's", "PhD", "Any"
      skills: string[];        // Max 20 skills
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}
```

### Target Student Schema

```typescript
{
  field: string;      // Field of study
  level: string;      // Education level
  skills: string[];   // Required/preferred skills
}
```

---

## Validation Rules

### Company Profile

| Field | Validation |
|-------|------------|
| name | 2-100 characters, required |
| industry | 2-100 characters, required |
| size | Must be one of the predefined ranges, required |
| founded | 4-digit year (e.g., 2015), required |
| description | 20-2000 characters, required |
| email | Valid email format, required |
| website | Valid URL with http/https |
| phone | Optional, any format |
| address | Max 200 characters |
| logo | Optional, base64 or URL |

### Target Students

| Field | Validation |
|-------|------------|
| field | 2-100 characters, required |
| level | Must be one of: "High School", "Vocational", "Bachelor's", "Master's", "PhD", "Any" |
| skills | Max 20 skills per preference |
| Max preferences | 10 per company |

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Missing required fields",
  "required": ["name", "industry", "size", "founded", "description", "email"]
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized: User ID required"
}
```

### 404 Not Found

```json
{
  "message": "Company profile not found"
}
```

---

## Usage Examples

### Fetch Company Profile (Frontend)

```typescript
// apps/web/src/lib/companyProfileApi.ts
import { apiClient } from './apiClient';

export interface CompanyProfile {
  _id: string;
  name: string;
  industry: string;
  size: string;
  founded: string;
  description: string;
  logo: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  targetStudents: Array<{
    _id: string;
    field: string;
    level: string;
    skills: string[];
  }>;
}

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const response = await apiClient.get('/company/profile');
  return response.data.profile;
};

export const updateCompanyProfile = async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
  const response = await apiClient.put('/company/profile', data);
  return response.data.profile;
};

export const addTargetStudent = async (student: {
  field: string;
  level: string;
  skills: string[];
}): Promise<CompanyProfile> => {
  const response = await apiClient.post('/company/profile/target-students', student);
  return response.data.profile;
};

export const removeTargetStudent = async (id: string): Promise<CompanyProfile> => {
  const response = await apiClient.delete(`/company/profile/target-students/${id}`);
  return response.data.profile;
};
```

### Update Company Profile (React Component)

```typescript
const handleSave = async () => {
  try {
    await updateCompanyProfile({
      name: companyData.name,
      industry: companyData.industry,
      size: companyData.size,
      founded: companyData.founded,
      description: companyData.description,
      logo: companyData.logo,
      website: companyData.website,
      email: companyData.email,
      phone: companyData.phone,
      address: companyData.address,
      targetStudents: targetStudents,
    });
    // Show success message
  } catch (error) {
    // Show error message
  }
};
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/models/CompanyProfile.ts` | Mongoose schema and model |
| `src/controllers/companyProfile.controller.ts` | Route handlers |
| `src/routes/v1/companyProfile.route.ts` | API routes |
| `src/routes/v1/index.ts` | Route registration |

---

## Future Enhancements

Potential improvements to consider:

1. **Logo Upload Endpoint** - Direct file upload to cloud storage
2. **Profile Verification** - Company verification badge system
3. **Analytics** - Track profile views and engagement
4. **Social Links** - Add LinkedIn, Twitter, etc.
5. **Company Culture** - Add culture tags and benefits
6. **Office Locations** - Multiple office addresses
7. **Team Members** - Add key team member profiles
