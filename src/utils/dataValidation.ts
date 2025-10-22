import { Institution } from '../types';
import { institutions } from '../data/institutions';

/**
 * Ground Truth Statistics Interface
 *
 * Represents programmatically calculated statistics from the institutional dataset.
 * These statistics serve as the "ground truth" for validating LLM responses and
 * ensuring accurate data representation in the dashboard.
 *
 * Used for: AI context embedding, validation checks, and dashboard accuracy verification
 */
export interface GroundTruthStats {
  totalInstitutions: number;
  carnegieClassifications: {
    total: number;
    breakdown: Record<string, { count: number; percentage: string }>;
  };
  institutionTypes: {
    total: number;
    breakdown: Record<string, { count: number; percentage: string }>;
  };
  wacPrograms: {
    total: number;
    percentage: string;
  };
  writingCenters: {
    total: number;
    percentage: string;
  };
  r1Institutions: {
    total: number;
    percentage: string;
    list: string[];
  };
}

/**
 * Calculate accurate percentage with proper rounding
 *
 * Purpose: Ensures consistent percentage calculations across all validation utilities.
 * Time-saving tip: Use this helper to avoid floating-point precision issues.
 *
 * @param count - The count of items in the subset
 * @param total - The total count of all items
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string with % symbol
 *
 * @example
 * calculatePercentage(8, 12, 1) // Returns "66.7%"
 * calculatePercentage(6, 12, 0) // Returns "50%"
 */
export function calculatePercentage(
  count: number,
  total: number,
  decimals: number = 1
): string {
  if (total === 0) return '0%';
  const percentage = (count / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Validate count claims against actual array length
 *
 * Purpose: Catches the common LLM error of claiming "N institutions" while
 * providing a different number of items in the response array.
 *
 * @param claimedCount - The count stated by the LLM
 * @param actualArray - The actual array of items provided
 * @returns Validation result with pass/fail and details
 *
 * @example
 * const result = validateCount(8, institutionArray);
 * if (!result.isValid) {
 *   console.error(result.message);
 * }
 */
export function validateCount<T>(
  claimedCount: number,
  actualArray: T[]
): { isValid: boolean; message: string; actualCount: number } {
  const actualCount = actualArray.length;
  const isValid = claimedCount === actualCount;

  return {
    isValid,
    actualCount,
    message: isValid
      ? `Count validation passed: ${claimedCount} matches array length`
      : `Count mismatch: claimed ${claimedCount} but array contains ${actualCount} items`,
  };
}

/**
 * Get programmatically calculated ground truth statistics
 *
 * Purpose: Provides the definitive source of truth for institutional statistics.
 * This function calculates all statistics directly from the data, eliminating
 * the possibility of hardcoded values becoming stale.
 *
 * Use case: Embed these statistics in LLM prompts to provide accurate context
 * for queries about institutional counts and distributions.
 *
 * @param institutionList - Optional custom list of institutions (defaults to all)
 * @returns Complete ground truth statistics object
 *
 * @example
 * const stats = getGroundTruthStats();
 * console.log(`Total R1 institutions: ${stats.r1Institutions.total}`);
 * console.log(`R1 names: ${stats.r1Institutions.list.join(', ')}`);
 */
export function getGroundTruthStats(
  institutionList: Institution[] = institutions
): GroundTruthStats {
  const total = institutionList.length;

  // Carnegie Classification breakdown
  const carnegieBreakdown: Record<string, { count: number; percentage: string }> = {};
  const carnegieCounts = institutionList.reduce((acc, inst) => {
    acc[inst.carnegieClassification] = (acc[inst.carnegieClassification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(carnegieCounts).forEach(([classification, count]) => {
    carnegieBreakdown[classification] = {
      count,
      percentage: calculatePercentage(count, total),
    };
  });

  // Institution Type breakdown
  const typeBreakdown: Record<string, { count: number; percentage: string }> = {};
  const typeCounts = institutionList.reduce((acc, inst) => {
    acc[inst.institutionType] = (acc[inst.institutionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(typeCounts).forEach(([type, count]) => {
    typeBreakdown[type] = {
      count,
      percentage: calculatePercentage(count, total),
    };
  });

  // WAC Programs
  const wacCount = institutionList.filter((i) => i.hasWACProgram).length;

  // Writing Centers
  const writingCenterCount = institutionList.filter((i) => i.hasWritingCenter).length;

  // R1 Institutions (detailed tracking)
  const r1Institutions = institutionList.filter(
    (i) => i.carnegieClassification === 'R1: Doctoral Universities – Very High Research Activity'
  );
  const r1Count = r1Institutions.length;
  const r1Names = r1Institutions.map((i) => i.shortName).sort();

  return {
    totalInstitutions: total,
    carnegieClassifications: {
      total: Object.keys(carnegieBreakdown).length,
      breakdown: carnegieBreakdown,
    },
    institutionTypes: {
      total: Object.keys(typeBreakdown).length,
      breakdown: typeBreakdown,
    },
    wacPrograms: {
      total: wacCount,
      percentage: calculatePercentage(wacCount, total),
    },
    writingCenters: {
      total: writingCenterCount,
      percentage: calculatePercentage(writingCenterCount, total),
    },
    r1Institutions: {
      total: r1Count,
      percentage: calculatePercentage(r1Count, total),
      list: r1Names,
    },
  };
}

/**
 * Generate a text summary for AI context embedding
 *
 * Purpose: Creates a human-readable summary of ground truth statistics that can
 * be embedded directly into LLM prompts. This helps Claude understand the exact
 * composition of the dataset before answering queries.
 *
 * Time-saving tip: Include this summary at the start of your prompts to reduce
 * counting errors and improve response accuracy.
 *
 * @param stats - Ground truth statistics (from getGroundTruthStats)
 * @returns Formatted text summary ready for prompt embedding
 *
 * @example
 * const stats = getGroundTruthStats();
 * const summary = generateDataSummary(stats);
 * const prompt = `${summary}\n\nUser question: How many R1 institutions are there?`;
 */
export function generateDataSummary(stats: GroundTruthStats): string {
  const lines: string[] = [
    '=== GROUND TRUTH DATA STATISTICS ===',
    '',
    `Total Institutions: ${stats.totalInstitutions}`,
    '',
    'Carnegie Classifications:',
  ];

  Object.entries(stats.carnegieClassifications.breakdown).forEach(([classification, data]) => {
    lines.push(`  - ${classification}: ${data.count} (${data.percentage})`);
  });

  lines.push('', 'Institution Types:');
  Object.entries(stats.institutionTypes.breakdown).forEach(([type, data]) => {
    lines.push(`  - ${type}: ${data.count} (${data.percentage})`);
  });

  lines.push(
    '',
    `WAC Programs: ${stats.wacPrograms.total} institutions (${stats.wacPrograms.percentage})`,
    `Writing Centers: ${stats.writingCenters.total} institutions (${stats.writingCenters.percentage})`,
    '',
    `R1 Institutions: ${stats.r1Institutions.total} (${stats.r1Institutions.percentage})`,
    `R1 List: ${stats.r1Institutions.list.join(', ')}`,
    '',
    '=== END GROUND TRUTH ===',
  );

  return lines.join('\n');
}
