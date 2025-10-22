# Data Validation Utilities

## Overview

This directory contains comprehensive data validation utilities designed to prevent LLM counting errors and hallucinations when working with institutional data.

## Current Status

**Status**: ✅ Built and tested, currently **disabled** in production UI

The validation utilities are fully functional but hidden from end users. They remain available for:
- Debugging during development
- Future feature activation
- Testing and quality assurance
- API integration validation

## Files

### Core Utilities

- **`dataValidation.ts`** - Ground truth statistics calculation
  - `getGroundTruthStats()` - Programmatic calculation of all institutional stats
  - `calculatePercentage()` - Accurate percentage calculations
  - `generateDataSummary()` - Text summary for AI context embedding
  - `validateCount()` - Count verification helper

- **`llmValidation.ts`** - Zod schemas for runtime validation
  - `InstitutionAnalysisSchema` - Schema with self-validation refinement
  - `FilteredDataResponseSchema` - Schema for filtered data responses
  - `validateLLMCounts()` - Central validation function
  - `isValidInstitution()` - Type guard for Institution objects

- **`claudeIntegration.ts`** - Claude-specific integration utilities
  - `createStructuredPrompt()` - Embeds ground truth into prompts
  - `validateClaudeResponse()` - Post-processes responses with auto-correction
  - `extractInstitutionIds()` - Normalizes response formats
  - `verifyResponseAccuracy()` - Double-checks against ground truth

- **`index.ts`** - Central export point with quick-start examples

## How to Re-Enable Validation

### Option 1: Show Validation Warnings in Chat UI

Edit `src/components/ChatTab.tsx`:

```typescript
// Line 137: Change this flag from false to true
const ENABLE_VALIDATION_WARNINGS = true;
```

This will show yellow warning boxes when Claude makes counting errors.

### Option 2: Add Ground Truth to System Prompt

Edit `src/components/ChatTab.tsx` (around line 36):

```typescript
// Uncomment this line:
const groundTruthSummary = generateDataSummary(groundTruthStats);

// Update system prompt to include:
${groundTruthSummary}

CRITICAL: Before answering any question about counts or numbers:
1. Check the ground truth statistics above
2. Ensure your count EXACTLY matches the number of items you list
3. If you claim "8 institutions", your list MUST contain exactly 8 items
4. Double-check your counting before responding
```

### Option 3: Use Validation Utilities Directly

```typescript
import {
  getGroundTruthStats,
  generateDataSummary,
  validateClaudeResponse
} from './utils';

// Get accurate statistics
const stats = getGroundTruthStats();
console.log(`R1 Institutions: ${stats.r1Institutions.total}`);

// Create validated prompts
const prompt = createStructuredPrompt(
  "How many R1 institutions have writing centers?"
);

// Validate responses
const result = validateClaudeResponse(claudeResponse, 'analysis');
if (result.corrected) {
  console.warn(`Count corrected from ${result.originalCount} to ${result.data.count}`);
}
```

## Best Practices for Future Use

### 1. Feature Flag Pattern (Recommended)

Create an environment variable to control validation:

```typescript
// .env
VITE_ENABLE_VALIDATION=false

// ChatTab.tsx
const ENABLE_VALIDATION_WARNINGS = import.meta.env.VITE_ENABLE_VALIDATION === 'true';
```

### 2. Development-Only Mode

Enable validation in development but hide in production:

```typescript
const ENABLE_VALIDATION_WARNINGS = import.meta.env.DEV;
```

### 3. Logging Strategy

The validation currently logs to console with `[VALIDATION]` prefix. Monitor these logs during development:

```typescript
// Search browser console for:
// "[VALIDATION] ⚠️ Validation Warning: ..."
```

### 4. Testing Validation

To test that validation still works:

1. Set `ENABLE_VALIDATION_WARNINGS = true` in ChatTab.tsx
2. Ask in chat: "How many R1 institutions are there?"
3. Watch for yellow warning boxes if counts mismatch
4. Check browser console for `[VALIDATION]` logs
5. Reset flag to `false` when done testing

## Dependencies

- **Zod** (v3.23.8) - Runtime validation and schema definition
  - Installed in `package.json`
  - Used for structured response validation

## Ground Truth Data

The utilities use the actual dataset (`src/data/institutions.ts`) as the source of truth:

- **Total Institutions**: 12
- **R1 Institutions**: 8 (UC Berkeley, Duke, Texas A&M, MIT, Michigan, Emory, ASU, GMU)
- **R2 Institutions**: 1 (Portland State)
- **Baccalaureate Colleges**: 2 (Lafayette, Carleton)
- **Associate's Colleges**: 1 (Miami Dade)

## Why This Was Disabled

The validation was working correctly but removed from user-facing UI to:
1. Reduce visual clutter for end users
2. Avoid exposing "ground truth" terminology to non-technical audiences
3. Keep the chat interface clean and simple
4. Maintain debugging capabilities for development

## Maintenance

When updating institutional data in `src/data/institutions.ts`:
- Ground truth statistics automatically recalculate
- No manual updates needed to validation utilities
- Test validation after data changes to ensure accuracy

## TypeScript Types

Validation types are defined in `src/types/index.ts`:
- `ValidationMetadata` - Metadata for data integrity checks
- `InstitutionStatisticsWithMetadata` - Enhanced statistics with validation

## Future Enhancements

Potential additions if re-enabled:
1. Admin dashboard showing validation metrics
2. Export validation reports for debugging
3. A/B testing to compare Claude responses with/without ground truth
4. Automated alerts when validation failure rate exceeds threshold
5. Historical tracking of validation corrections

---

**Last Updated**: October 2025
**Status**: Dormant (ready for reactivation)
**Maintained By**: WAC Dashboard Development Team
