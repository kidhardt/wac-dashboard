import { z } from 'zod';
import { Institution } from '../types';

/**
 * Zod schema for Institution Analysis responses from LLMs
 *
 * Purpose: Validates that LLM responses contain both a count claim AND a matching
 * array of institutions. The refinement ensures the claimed count matches the
 * actual array length, catching the common LLM error of mismatched counts.
 *
 * Use case: When asking Claude to analyze or filter institutions and return
 * both a count and a list of matching institutions.
 *
 * @example
 * const response = {
 *   count: 8,
 *   institutions: [... 8 institutions ...],
 *   reasoning: "These R1 institutions match the criteria"
 * };
 * const validated = InstitutionAnalysisSchema.parse(response);
 */
export const InstitutionAnalysisSchema = z
  .object({
    count: z.number().int().nonnegative().describe('The claimed number of institutions'),
    institutions: z
      .array(z.string())
      .describe('Array of institution IDs or names that match the criteria'),
    reasoning: z.string().optional().describe('Explanation of the analysis'),
  })
  .refine(
    (data) => data.count === data.institutions.length,
    (data) => ({
      message: `Count mismatch: claimed ${data.count} institutions but provided ${data.institutions.length} in the array`,
      path: ['count'],
    })
  );

/**
 * Zod schema for Filtered Data responses with full Institution objects
 *
 * Purpose: Validates responses where the LLM returns complete Institution objects
 * along with a count. Ensures data integrity and count accuracy.
 *
 * Use case: When asking Claude to filter the dataset and return full institution
 * details (not just IDs).
 *
 * @example
 * const response = {
 *   count: 8,
 *   data: [... 8 full Institution objects ...],
 *   summary: "R1 institutions with writing centers"
 * };
 * const validated = FilteredDataResponseSchema.parse(response);
 */
export const FilteredDataResponseSchema = z
  .object({
    count: z.number().int().nonnegative().describe('The claimed number of institutions'),
    data: z.array(z.record(z.any())).describe('Array of institution objects'),
    summary: z.string().optional().describe('Summary of the filtered results'),
    metadata: z
      .object({
        filters: z.array(z.string()).optional(),
        timestamp: z.string().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => data.count === data.data.length,
    (data) => ({
      message: `Count mismatch: claimed ${data.count} institutions but provided ${data.data.length} in the array`,
      path: ['count'],
    })
  );

/**
 * Zod schema for simple count-only responses
 *
 * Purpose: Validates responses where the LLM only provides a count without
 * returning the full list. Useful for quick statistics.
 *
 * @example
 * const response = { count: 8, category: "R1 institutions" };
 * const validated = CountOnlyResponseSchema.parse(response);
 */
export const CountOnlyResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  category: z.string().describe('Description of what is being counted'),
  breakdown: z.record(z.number()).optional().describe('Optional categorical breakdown'),
});

/**
 * Validation result interface for LLM output validation
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: z.ZodError;
  message: string;
}

/**
 * Validate LLM count-based responses against Zod schemas
 *
 * Purpose: Central validation function for all LLM responses that include counts.
 * Prevents count mismatches from reaching the UI and causing user confusion.
 *
 * Time-saving tip: Always validate LLM responses before using them in the dashboard
 * to catch hallucinations and counting errors early.
 *
 * @param response - The raw response from the LLM
 * @param schema - The Zod schema to validate against
 * @returns Validation result with parsed data or error details
 *
 * @example
 * // Validate an institution analysis response
 * const result = validateLLMCounts(
 *   llmResponse,
 *   InstitutionAnalysisSchema
 * );
 *
 * if (result.isValid) {
 *   console.log(`Validated: ${result.data.count} institutions`);
 * } else {
 *   console.error(`Validation failed: ${result.message}`);
 * }
 */
export function validateLLMCounts<T>(
  response: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const parsed = schema.parse(response);
    return {
      isValid: true,
      data: parsed,
      message: 'Validation successful',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error,
        message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      };
    }
    return {
      isValid: false,
      message: 'Unknown validation error',
    };
  }
}

/**
 * Type guard to check if an object is a valid Institution
 *
 * Purpose: Runtime type checking for Institution objects returned by LLMs.
 * Ensures all required fields are present and have correct types.
 *
 * @param obj - Object to check
 * @returns True if object matches Institution interface
 *
 * @example
 * if (isValidInstitution(llmResponse)) {
 *   // TypeScript now knows this is an Institution
 *   console.log(llmResponse.name);
 * }
 */
export function isValidInstitution(obj: any): obj is Institution {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.shortName === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.coordinates === 'object' &&
    typeof obj.coordinates.lat === 'number' &&
    typeof obj.coordinates.lng === 'number' &&
    ['public', 'private', 'community'].includes(obj.institutionType) &&
    typeof obj.carnegieClassification === 'string' &&
    typeof obj.hasWACProgram === 'boolean' &&
    typeof obj.hasWritingCenter === 'boolean'
  );
}

/**
 * Validate an array of institutions with count verification
 *
 * Purpose: Validates that an array contains valid Institution objects and
 * matches an optional claimed count.
 *
 * @param institutions - Array of institution objects to validate
 * @param claimedCount - Optional count to verify against
 * @returns Validation result with details
 *
 * @example
 * const result = validateInstitutionArray(llmResponse.data, llmResponse.count);
 * if (!result.isValid) {
 *   console.error(`Invalid institutions: ${result.message}`);
 * }
 */
export function validateInstitutionArray(
  institutions: unknown[],
  claimedCount?: number
): ValidationResult<Institution[]> {
  // Check if all items are valid institutions
  const invalidIndices: number[] = [];
  institutions.forEach((inst, index) => {
    if (!isValidInstitution(inst)) {
      invalidIndices.push(index);
    }
  });

  if (invalidIndices.length > 0) {
    return {
      isValid: false,
      message: `Invalid institution objects at indices: ${invalidIndices.join(', ')}`,
    };
  }

  // Verify count if provided
  if (claimedCount !== undefined && claimedCount !== institutions.length) {
    return {
      isValid: false,
      message: `Count mismatch: claimed ${claimedCount} but array contains ${institutions.length}`,
    };
  }

  return {
    isValid: true,
    data: institutions as Institution[],
    message: 'All institutions valid',
  };
}
