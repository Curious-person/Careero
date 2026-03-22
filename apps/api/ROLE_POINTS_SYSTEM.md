# Role Points System Documentation

## Overview

The Role Points System automatically calculates a point value for each job role based on the **skills required** and the **linked accumulations**. This provides a standardized way to measure the complexity and value of each role.

---

## Points Formula

```
Total Points = Skill Points + Accumulation Points
```

### 1. Skill Points

Skill points reward roles that require more skills and recognize the added complexity of managing multiple skill requirements.

**Formula:**
```
Skill Points = Base Skill Value × Number of Skills × Complexity Multiplier
```

**Components:**
- **Base Skill Value**: `50 points` per skill
- **Number of Skills**: Count of skills selected (1-10)
- **Complexity Multiplier**: `1.0 + (0.1 × (skillCount - 1))`

**Complexity Multiplier Table:**

| Skills | Multiplier | Calculation |
|--------|------------|-------------|
| 1 | ×1.0 | 1.0 + (0.1 × 0) |
| 2 | ×1.1 | 1.0 + (0.1 × 1) |
| 3 | ×1.2 | 1.0 + (0.1 × 2) |
| 4 | ×1.3 | 1.0 + (0.1 × 3) |
| 5 | ×1.4 | 1.0 + (0.1 × 4) |
| 6 | ×1.5 | 1.0 + (0.1 × 5) |
| 7 | ×1.6 | 1.0 + (0.1 × 6) |
| 8 | ×1.7 | 1.0 + (0.1 × 7) |
| 9 | ×1.8 | 1.0 + (0.1 × 8) |
| 10 | ×1.9 | 1.0 + (0.1 × 9) |

**Rationale:**
- Each skill adds value (50 pts base)
- More skills = more complexity = bonus multiplier
- Maximum multiplier is 1.9× (for 10 skills)
- Encourages comprehensive role definitions

---

### 2. Accumulation Points

Accumulation points incorporate the point value of linked accumulations (training programs, challenges, courses, events) into the role's total.

**Formula:**
```
Accumulation Points = Sum of Linked Accumulation Points × 0.5
```

**Components:**
- **Sum of Linked Accumulation Points**: Total points from all selected accumulations
- **Weight**: `0.5` (50% of accumulation value)

**Rationale:**
- Accumulations contribute to role complexity
- 50% weight prevents accumulation points from dominating
- Ensures skills remain the primary factor
- Recognizes training/development investment

---

## Calculation Examples

### Example 1: Entry-Level Role

**Inputs:**
- Skills: 3 skills (JavaScript, React, Node.js)
- Accumulations: 100 points total

**Calculation:**
```
Skill Points = 50 × 3 × (1.0 + 0.1 × 2)
             = 50 × 3 × 1.2
             = 180 points

Accumulation Points = 100 × 0.5
                    = 50 points

Total Points = 180 + 50 = 230 points
```

---

### Example 2: Mid-Level Role

**Inputs:**
- Skills: 5 skills (Python, Django, PostgreSQL, Docker, AWS)
- Accumulations: 200 points total

**Calculation:**
```
Skill Points = 50 × 5 × (1.0 + 0.1 × 4)
             = 50 × 5 × 1.4
             = 350 points

Accumulation Points = 200 × 0.5
                    = 100 points

Total Points = 350 + 100 = 450 points
```

---

### Example 3: Senior/Expert Role

**Inputs:**
- Skills: 10 skills (JavaScript, TypeScript, React, Next.js, Node.js, PostgreSQL, MongoDB, AWS, Docker, Kubernetes)
- Accumulations: 400 points total

**Calculation:**
```
Skill Points = 50 × 10 × (1.0 + 0.1 × 9)
             = 50 × 10 × 1.9
             = 950 points

Accumulation Points = 400 × 0.5
                    = 200 points

Total Points = 950 + 200 = 1,150 points
```

---

## Points Range Guide

| Role Level | Typical Points | Skills | Accumulation Points |
|------------|----------------|--------|---------------------|
| Entry-Level | 200-350 | 2-4 | 50-100 |
| Mid-Level | 350-600 | 5-7 | 100-200 |
| Senior-Level | 600-900 | 7-9 | 200-350 |
| Expert/Lead | 900+ | 10 | 350+ |

---

## Implementation Details

### Database Schema

The `points` field is stored in the Role model:

```typescript
{
  points: {
    type: Number,
    default: 0,
    min: 0,
  }
}
```

### Calculation Method

The `calculatePoints` static method is defined on the Role model:

```typescript
RoleSchema.statics.calculatePoints = async function(skills: string[], accumulationIds: string[]) {
  // Skill points calculation
  const BASE_SKILL_VALUE = 50;
  const skillCount = skills.length;
  const complexityMultiplier = 1.0 + (0.1 * (skillCount - 1));
  const skillPoints = Math.round(BASE_SKILL_VALUE * skillCount * complexityMultiplier);

  // Accumulation points calculation
  const accumulations = await this.db.model('Accumulation').find({
    _id: { $in: accumulationIds }
  });
  
  const totalAccumulationPoints = accumulations.reduce((sum, acc) => sum + (acc.points || 0), 0);
  const ACCUMULATION_WEIGHT = 0.5;
  const accumulationPoints = Math.round(totalAccumulationPoints * ACCUMULATION_WEIGHT);

  // Total points
  const totalPoints = skillPoints + accumulationPoints;

  return {
    totalPoints,
    breakdown: {
      skillPoints,
      accumulationPoints,
      skillCount,
      complexityMultiplier,
      totalAccumulationPoints,
      accumulationCount: accumulations.length,
    },
  };
};
```

### Controller Usage

When creating a role, points are automatically calculated:

```typescript
// Calculate role points based on skills and accumulations
const { totalPoints, breakdown } = await Role.calculatePoints(skills, accumulationIds);

// Create role with calculated points
const role = await Role.create({
  // ... other fields
  points: totalPoints,
});
```

### Console Output

The calculation is logged for debugging:

```
╔══════════════════════════════════════════════════════════╗
║                    POINTS CALCULATION                    ║
╚══════════════════════════════════════════════════════════╝
📊 Skill Points: 350
   - Base Value: 50 points per skill
   - Skill Count: 5
   - Complexity Multiplier: ×1.40
📅 Accumulation Points: 100
   - Total Accumulation Points: 200
   - Weight Applied: ×0.5 (50%)
🎯 TOTAL POINTS: 450
═══════════════════════════════════════════════════════════
```

---

## API Response

When retrieving a role, the points field is included:

```json
{
  "role": {
    "_id": "...",
    "title": "Software Engineer",
    "department": "Engineering",
    "skills": ["JavaScript", "React", "Node.js"],
    "accumulationIds": ["...", "..."],
    "points": 230,
    // ... other fields
  }
}
```

---

## Design Decisions

### Why 50 Points Per Skill?

- Provides meaningful differentiation between roles
- Scales well with the complexity multiplier
- Easy to understand and communicate

### Why Complexity Multiplier?

- Recognizes that managing multiple skills is harder than single skills
- Encourages comprehensive role definitions
- Prevents gaming the system with single high-value skills

### Why 50% Weight for Accumulations?

- Keeps skills as the primary factor (roughly 70-80% of total)
- Acknowledges training/development investment
- Prevents accumulation points from dominating the calculation
- Maintains balance between skill requirements and training programs

### Why Allow Any Accumulation?

- Companies can link to school accumulations
- Promotes collaboration between schools and companies
- Provides flexibility in role-accumulation matching

---

## Future Enhancements

Potential improvements to consider:

1. **Skill Weighting**: Different skills could have different base values based on demand/difficulty
2. **Experience Multiplier**: Factor in years of experience required
3. **Location Adjustment**: Adjust points based on location cost of living
4. **Dynamic Weights**: Allow admins to adjust the accumulation weight
5. **Points History**: Track how points change over time

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/models/Role.ts` | Role schema with points field and calculatePoints method |
| `src/controllers/role.controller.ts` | Calls calculatePoints during role creation |
| `apps/web/src/lib/rolesApi.ts` | TypeScript interface with points field |
| `apps/web/src/app/dashboard/company/team/page.tsx` | Displays points in roles table |

---

## Support

For questions or issues regarding the points system, refer to the code comments in `src/models/Role.ts` or check the console logs during role creation.
