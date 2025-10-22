/**
 * WAC Dashboard Validation Utilities
 *
 * This module exports comprehensive data validation utilities for ensuring
 * accuracy and consistency when working with LLM-generated responses about
 * institutional data.
 *
 * Purpose: Centralized export point for all validation utilities used throughout
 * the WAC dashboard. These utilities help prevent common LLM errors like count
 * mismatches and hallucinations.
 *
 * For time-constrained practitioners: Import what you need from this single file
 * rather than navigating individual utility files.
 *
 * @module utils
 */

// Data Validation - Ground truth statistics and calculations
export {
  getGroundTruthStats,
  calculatePercentage,
  generateDataSummary,
  validateCount,
  type GroundTruthStats,
} from './dataValidation';

// LLM Validation - Zod schemas and validation functions
export {
  InstitutionAnalysisSchema,
  FilteredDataResponseSchema,
  CountOnlyResponseSchema,
  validateLLMCounts,
  isValidInstitution,
  validateInstitutionArray,
  type ValidationResult,
} from './llmValidation';

// Claude Integration - Prompt creation and response validation
export {
  createStructuredPrompt,
  validateClaudeResponse,
  extractInstitutionIds,
  createValidationReport,
  verifyResponseAccuracy,
} from './claudeIntegration';

/**
 * Quick Start Examples:
 *
 * 1. Get ground truth statistics:
 *    ```typescript
 *    import { getGroundTruthStats, generateDataSummary } from './utils';
 *    const stats = getGroundTruthStats();
 *    console.log(generateDataSummary(stats));
 *    ```
 *
 * 2. Create a validated prompt for Claude:
 *    ```typescript
 *    import { createStructuredPrompt } from './utils';
 *    const prompt = createStructuredPrompt(
 *      "How many R1 institutions have writing centers?"
 *    );
 *    // Send to Claude API
 *    ```
 *
 * 3. Validate Claude's response:
 *    ```typescript
 *    import { validateClaudeResponse, createValidationReport } from './utils';
 *    const result = validateClaudeResponse(claudeResponse, 'analysis');
 *    console.log(createValidationReport(result));
 *    ```
 *
 * 4. Check data integrity:
 *    ```typescript
 *    import { validateCount } from './utils';
 *    const check = validateCount(8, institutionArray);
 *    if (!check.isValid) {
 *      console.error(check.message);
 *    }
 *    ```
 */
