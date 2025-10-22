import { Institution } from '../types';

/**
 * Complete dataset of 24 institutions
 * Data represents a diverse sample across different institution types,
 * geographic regions, and WAC program structures
 *
 * Updated: January 2025
 * - 12 original institutions with established WAC programs
 * - 12 new institutions with complete survey data
 */

// Import the complete JSON data
import institutionsData from './wac-institutions-complete.json';

export const institutions: Institution[] = institutionsData as Institution[];

/**
 * Helper function to get unique states from institutions
 */
export const getUniqueStates = (): string[] => {
  return Array.from(new Set(institutions.map(inst => inst.state))).sort();
};

/**
 * Helper function to get unique institution types
 */
export const getInstitutionTypes = (): ('public' | 'private' | 'community')[] => {
  return Array.from(new Set(institutions.map(inst => inst.institutionType)));
};

/**
 * Helper function to simplify Carnegie classification labels for dashboard display
 */
export const simplifyCarnegieClassification = (classification: string): string => {
  if (classification.includes('R1')) return 'R1 Doctoral';
  if (classification.includes('R2')) return 'R2 Doctoral';
  if (classification.includes('Baccalaureate')) return 'Baccalaureate';
  if (classification.includes("Master's") && classification.includes('Larger')) return 'Masters Larger';
  if (classification.includes("Master's") && classification.includes('Medium')) return 'Masters Medium';
  if (classification.includes("Associate's") && classification.includes('Mixed')) return 'Associates Mixed';
  if (classification.includes("Associate's") && classification.includes('Traditional')) return 'Associates Traditional';
  if (classification.includes('Special Focus')) return 'Special Focus';
  // Fallback for "Doctoral Universities: High Research Activity" (no R1/R2 prefix)
  if (classification.includes('Doctoral') && classification.includes('High Research')) return 'R2 Doctoral';
  return classification;
};

/**
 * Helper function to get unique Carnegie classifications in preferred order
 */
export const getCarnegieClassifications = (): string[] => {
  const uniqueClassifications = Array.from(new Set(institutions.map(inst => inst.carnegieClassification)));

  // Define preferred order
  const order = [
    'R1: Doctoral Universities – Very High Research Activity',
    'R2: Doctoral Universities – High Research Activity',
    'Doctoral Universities: High Research Activity',
    'Baccalaureate Colleges: Arts & Sciences Focus',
    "Master's Colleges & Universities: Larger Programs",
    "Master's Colleges & Universities: Medium Programs",
    "Associate's Colleges: High Transfer-High Traditional",
    "Associate's Colleges: High Transfer-Mixed Traditional/Nontraditional",
    'Special Focus Four-Year: Other Special Focus Institutions'
  ];

  // Sort based on the order array
  return uniqueClassifications.sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);

    // If both are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A is in the order array, it comes first
    if (indexA !== -1) return -1;
    // If only B is in the order array, it comes first
    if (indexB !== -1) return 1;
    // Otherwise, alphabetically sort
    return a.localeCompare(b);
  });
};

/**
 * Helper function to get enrollment range across all institutions
 */
export const getEnrollmentRange = (): { min: number; max: number } => {
  const enrollments = institutions.map(inst => inst.totalEnrollment);
  return {
    min: Math.min(...enrollments),
    max: Math.max(...enrollments),
  };
};

/**
 * Helper function to get budget range for WAC programs
 */
export const getBudgetRange = (): { min: number; max: number } => {
  const budgets = institutions
    .map(inst => inst.wacBudget)
    .filter((b): b is number => b !== null);

  if (budgets.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...budgets),
    max: Math.max(...budgets),
  };
};

/**
 * Helper function to get year range for WAC program establishment
 */
export const getEstablishedYearRange = (): { min: number; max: number } => {
  const years = institutions
    .map(inst => inst.wacProgramEstablished)
    .filter((y): y is number => y !== null);

  if (years.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
};

/**
 * Calculate statistics across all institutions with validation metadata
 *
 * Enhanced version that includes a _metadata field with validation checks
 * to ensure data integrity and provide ground truth statistics for LLM validation.
 *
 * The _metadata field includes:
 * - calculatedAt: Timestamp of when statistics were calculated
 * - dataIntegrity: Validation checks on the data
 * - groundTruthCounts: Definitive counts for LLM validation
 */
export const calculateStatistics = (institutionList: Institution[] = institutions) => {
  const total = institutionList.length;
  const withWAC = institutionList.filter(i => i.hasWACProgram).length;
  const withWritingCenter = institutionList.filter(i => i.hasWritingCenter).length;

  const avgEnrollment = Math.round(
    institutionList.reduce((sum, i) => sum + i.totalEnrollment, 0) / total
  );

  const budgets = institutionList
    .map(i => i.wacBudget)
    .filter((b): b is number => b !== null);
  const avgBudget = budgets.length > 0
    ? Math.round(budgets.reduce((sum, b) => sum + b, 0) / budgets.length)
    : 0;

  const writingIntensiveCourses = institutionList
    .map(i => i.writingIntensiveCourses)
    .filter((c): c is number => c !== null);
  const totalWICourses = writingIntensiveCourses.reduce((sum, c) => sum + c, 0);

  // Carnegie classification breakdown for ground truth
  const carnegieStats = institutionList.reduce((acc, i) => {
    acc[i.carnegieClassification] = (acc[i.carnegieClassification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Institution type breakdown for ground truth
  const typeStats = institutionList.reduce((acc, i) => {
    acc[i.institutionType] = (acc[i.institutionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // State breakdown for ground truth
  const stateStats = institutionList.reduce((acc, i) => {
    acc[i.state] = (acc[i.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // R1 institutions for detailed tracking
  const r1Institutions = institutionList.filter(
    i => i.carnegieClassification === 'R1: Doctoral Universities – Very High Research Activity'
  );

  // Data integrity checks
  const hasAllWACPrograms = institutionList.every(i => typeof i.hasWACProgram === 'boolean');
  const hasAllWritingCenters = institutionList.every(i => typeof i.hasWritingCenter === 'boolean');
  const hasValidCoordinates = institutionList.every(
    i => typeof i.coordinates?.lat === 'number' && typeof i.coordinates?.lng === 'number'
  );

  return {
    totalInstitutions: total,
    withWACPrograms: withWAC,
    withWritingCenters: withWritingCenter,
    averageEnrollment: avgEnrollment,
    averageWACBudget: avgBudget,
    totalWritingIntensiveCourses: totalWICourses,
    institutionsByType: typeStats,
    institutionsByState: stateStats,
    carnegieClassificationStats: carnegieStats,

    // Validation metadata for LLM integration and data integrity
    _metadata: {
      calculatedAt: new Date().toISOString(),
      dataIntegrity: {
        allHaveWACProgramFlag: hasAllWACPrograms,
        allHaveWritingCenterFlag: hasAllWritingCenters,
        allHaveValidCoordinates: hasValidCoordinates,
        totalRecordsProcessed: total,
      },
      groundTruthCounts: {
        totalInstitutions: total,
        wacPrograms: withWAC,
        writingCenters: withWritingCenter,
        r1Institutions: r1Institutions.length,
        r1InstitutionNames: r1Institutions.map(i => i.shortName).sort(),
        carnegieClassifications: Object.keys(carnegieStats).length,
        institutionTypes: Object.keys(typeStats).length,
        statesRepresented: Object.keys(stateStats).length,
      },
    },
  };
};
