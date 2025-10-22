import { getGroundTruthStats, generateDataSummary } from './dataValidation';
import {
  validateLLMCounts,
  InstitutionAnalysisSchema,
  FilteredDataResponseSchema,
  ValidationResult,
} from './llmValidation';
import { institutions } from '../data/institutions';
import { Institution } from '../types';
import { z } from 'zod';

/**
 * Create a structured prompt with embedded ground truth statistics
 *
 * Purpose: Automatically embeds accurate dataset statistics into prompts sent to Claude.
 * This reduces hallucinations and counting errors by giving Claude the exact composition
 * of the dataset before answering questions.
 *
 * Time-saving tip: Always use this function when creating prompts that involve counting
 * or filtering institutions. The embedded statistics provide Claude with accurate context.
 *
 * @param userQuery - The user's question or request
 * @param includeFullData - Whether to include the complete institution dataset (default: false)
 * @param customInstructions - Optional additional instructions for Claude
 * @returns Formatted prompt with embedded ground truth data
 *
 * @example
 * const prompt = createStructuredPrompt(
 *   "How many R1 institutions have writing centers?",
 *   false,
 *   "Return your answer in JSON format with count and institution names"
 * );
 * // Send this prompt to Claude API
 */
export function createStructuredPrompt(
  userQuery: string,
  includeFullData: boolean = false,
  customInstructions?: string
): string {
  const stats = getGroundTruthStats();
  const summary = generateDataSummary(stats);

  const parts: string[] = [
    '# WAC Dashboard Data Query',
    '',
    '## Ground Truth Statistics',
    'Before answering the query, review these EXACT statistics from the dataset:',
    '',
    summary,
    '',
  ];

  if (includeFullData) {
    parts.push(
      '## Complete Dataset',
      'Here is the full institutional dataset for reference:',
      '',
      '```json',
      JSON.stringify(institutions, null, 2),
      '```',
      '',
    );
  }

  if (customInstructions) {
    parts.push('## Instructions', customInstructions, '');
  }

  parts.push(
    '## User Query',
    userQuery,
    '',
    '## Response Requirements',
    '- Base your answer ONLY on the provided data',
    '- If you claim a count (e.g., "8 institutions"), ensure your list contains exactly that many items',
    '- Double-check that your count matches your array length before responding',
    '- If uncertain, recount using the ground truth statistics above',
  );

  return parts.join('\n');
}

/**
 * Validate Claude's response and auto-correct count mismatches
 *
 * Purpose: Post-processes Claude's responses to catch and fix common counting errors.
 * When the claimed count doesn't match the array length, this function automatically
 * corrects it to prevent user confusion.
 *
 * Time-saving tip: Use this after receiving responses from Claude to ensure data
 * integrity before displaying results in the UI.
 *
 * @param response - Raw response from Claude (expected to have count and list)
 * @param responseType - Type of response ('analysis' | 'filtered' | 'custom')
 * @returns Validated and potentially corrected response
 *
 * @example
 * const claudeResponse = {
 *   count: 8,
 *   institutions: ['UC Berkeley', 'MIT', ... 7 items total]
 * };
 * const validated = validateClaudeResponse(claudeResponse, 'analysis');
 * // Returns corrected count: 7 (matching actual array length)
 */
export function validateClaudeResponse(
  response: any,
  responseType: 'analysis' | 'filtered' = 'analysis'
): ValidationResult<any> & { corrected?: boolean; originalCount?: number } {
  // Select appropriate schema - cast to z.ZodSchema<any> for type compatibility
  const schema: z.ZodSchema<any> = responseType === 'analysis' ? InstitutionAnalysisSchema : FilteredDataResponseSchema;

  // First attempt: validate as-is
  const validation = validateLLMCounts(response, schema);

  if (validation.isValid) {
    return {
      ...validation,
      corrected: false,
    };
  }

  // Check if the error is a count mismatch that we can auto-correct
  if (validation.errors && validation.message.includes('Count mismatch')) {
    const arrayField = responseType === 'analysis' ? 'institutions' : 'data';

    if (response[arrayField] && Array.isArray(response[arrayField])) {
      const actualCount = response[arrayField].length;
      const originalCount = response.count;

      // Auto-correct the count
      const correctedResponse = {
        ...response,
        count: actualCount,
      };

      // Re-validate
      const correctedValidation = validateLLMCounts(correctedResponse, schema);

      if (correctedValidation.isValid) {
        return {
          ...correctedValidation,
          corrected: true,
          originalCount,
          message: `Auto-corrected count mismatch: changed ${originalCount} to ${actualCount} (actual array length)`,
        };
      }
    }
  }

  // Return original validation failure if auto-correction didn't work
  return {
    ...validation,
    corrected: false,
  };
}

/**
 * Extract institution IDs from various response formats
 *
 * Purpose: Normalizes different response formats from Claude into a consistent
 * array of institution IDs. Handles both ID-based and name-based responses.
 *
 * @param response - Claude's response (can contain IDs or names)
 * @param institutionList - Reference list of institutions for name matching
 * @returns Array of institution IDs
 *
 * @example
 * const ids = extractInstitutionIds(claudeResponse, institutions);
 * const filtered = institutions.filter(inst => ids.includes(inst.id));
 */
export function extractInstitutionIds(
  response: any,
  institutionList: Institution[] = institutions
): string[] {
  // Handle array of IDs
  if (Array.isArray(response.institutions)) {
    // If institutions array contains objects, extract IDs
    if (response.institutions.length > 0 && typeof response.institutions[0] === 'object') {
      return response.institutions.map((inst: any) => inst.id);
    }
    // If institutions array contains strings, try to match as IDs or names
    return response.institutions
      .map((item: string) => {
        // First try direct ID match
        const byId = institutionList.find((inst) => inst.id === item);
        if (byId) return byId.id;

        // Then try name matching (case-insensitive)
        const itemLower = item.toLowerCase();
        const byName = institutionList.find(
          (inst) =>
            inst.name.toLowerCase() === itemLower ||
            inst.shortName.toLowerCase() === itemLower
        );
        return byName?.id;
      })
      .filter((id: string | undefined): id is string => id !== undefined);
  }

  // Handle array of full Institution objects
  if (Array.isArray(response.data)) {
    return response.data.map((inst: any) => inst.id).filter((id: any): id is string => id !== undefined);
  }

  return [];
}

/**
 * Create a validation report for dashboard display
 *
 * Purpose: Generates a human-readable validation report that can be shown to users
 * in the dashboard, explaining any corrections or issues with Claude's response.
 *
 * @param validationResult - Result from validateClaudeResponse
 * @returns Formatted validation report
 *
 * @example
 * const report = createValidationReport(validatedResponse);
 * console.log(report);
 * // "✓ Response validated successfully"
 * // or
 * // "⚠ Auto-corrected count from 8 to 7"
 */
export function createValidationReport(
  validationResult: ValidationResult<any> & { corrected?: boolean; originalCount?: number }
): string {
  if (!validationResult.isValid) {
    return `✗ Validation failed: ${validationResult.message}`;
  }

  if (validationResult.corrected && validationResult.originalCount !== undefined) {
    return `⚠ Auto-corrected: Count changed from ${validationResult.originalCount} to ${validationResult.data.count} to match actual results`;
  }

  return `✓ Response validated successfully`;
}

/**
 * Verify response accuracy against ground truth
 *
 * Purpose: Double-checks Claude's filtered results against the actual dataset
 * to ensure the response is factually correct.
 *
 * @param claimedInstitutionIds - IDs claimed by Claude's response
 * @param filterFunction - Filter function to verify against
 * @returns Accuracy report with any discrepancies
 *
 * @example
 * const accuracy = verifyResponseAccuracy(
 *   extractedIds,
 *   (inst) => inst.carnegieClassification.includes('R1')
 * );
 * if (!accuracy.isAccurate) {
 *   console.warn(`Missing: ${accuracy.missing.join(', ')}`);
 * }
 */
export function verifyResponseAccuracy(
  claimedInstitutionIds: string[],
  filterFunction: (inst: Institution) => boolean
): {
  isAccurate: boolean;
  expectedCount: number;
  receivedCount: number;
  missing: string[];
  extra: string[];
} {
  const expectedInstitutions = institutions.filter(filterFunction);
  const expectedIds = new Set(expectedInstitutions.map((i) => i.id));
  const receivedIds = new Set(claimedInstitutionIds);

  const missing = expectedInstitutions
    .filter((inst) => !receivedIds.has(inst.id))
    .map((inst) => inst.shortName);

  const extra = claimedInstitutionIds.filter((id) => !expectedIds.has(id));

  return {
    isAccurate: missing.length === 0 && extra.length === 0,
    expectedCount: expectedInstitutions.length,
    receivedCount: claimedInstitutionIds.length,
    missing,
    extra,
  };
}
