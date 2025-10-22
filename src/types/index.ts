// TypeScript type definitions for the WAC Dashboard

/**
 * Main Institution interface with all 28 variables for WAC program comparison
 */
export interface Institution {
  // Basic Information (5 variables)
  id: string;
  name: string;
  shortName: string;
  state: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };

  // Institutional Characteristics (6 variables)
  institutionType: 'public' | 'private' | 'community';
  carnegieClassification: string;
  totalEnrollment: number;
  undergraduateEnrollment: number;
  graduateEnrollment: number;
  foundedYear: number;

  // WAC Program Details (8 variables)
  hasWACProgram: boolean;
  wacProgramEstablished: number | null;
  wacDirectorPosition: boolean;
  wacFacultyFTE: number;
  wacBudget: number | null; // Annual budget in USD
  writingIntensiveCourses: number;
  requiredWICourses: number;
  wacWebsiteUrl: string;

  // Writing Support Services (5 variables)
  hasWritingCenter: boolean;
  writingCenterStaff: number;
  writingCenterHoursPerWeek: number;
  writingFellowsProgram: boolean;
  writingTutorsAvailable: number;

  // Faculty Development (3 variables)
  facultyWorkshopsPerYear: number;
  writingFacultyDevelopmentProgram: boolean;
  crossDisciplinaryWritingInitiatives: boolean;
}

/**
 * Filter state for controlling which institutions are displayed
 */
export interface FilterState {
  // Text search
  searchQuery: string;

  // Institution filters
  states: string[];
  institutionTypes: ('public' | 'private' | 'community')[];
  carnegieClassifications: string[];

  // Enrollment filters
  enrollmentRange: {
    min: number;
    max: number;
  };

  // WAC Program filters
  hasWACProgram: boolean | null;
  establishedYearRange: {
    min: number;
    max: number;
  };

  // Writing Support filters
  hasWritingCenter: boolean | null;
  hasWritingFellows: boolean | null;
  hasFacultyDevelopment: boolean | null;

  // Budget filters
  budgetRange: {
    min: number;
    max: number;
  };
}

/**
 * Statistics and aggregated data for dashboard display
 */
export interface InstitutionStatistics {
  totalInstitutions: number;
  withWACPrograms: number;
  withWritingCenters: number;
  averageEnrollment: number;
  averageWACBudget: number;
  totalWritingIntensiveCourses: number;
  institutionsByType: Record<string, number>;
  institutionsByState: Record<string, number>;
  carnegieClassificationStats: Record<string, number>;
}

/**
 * Chart data format for Recharts
 */
export interface ChartData {
  name: string;
  value: number;
  label?: string;
  fill?: string;
  [key: string]: string | number | undefined;
}

/**
 * Sort configuration for table sorting
 */
export interface SortConfig {
  field: keyof Institution;
  direction: SortDirection;
}

export type SortDirection = 'asc' | 'desc';

/**
 * View mode for the dashboard
 */
export type ViewMode = 'map' | 'table' | 'charts' | 'comparison' | 'chat';

/**
 * Comparison mode for side-by-side institution analysis
 */
export interface ComparisonData {
  institutions: Institution[];
  selectedVariables: (keyof Institution)[];
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json' | 'pdf';

/**
 * Map marker data
 */
export interface MapMarker {
  institution: Institution;
  position: [number, number];
  isSelected: boolean;
}

/**
 * Validation metadata for data integrity checks
 *
 * Purpose: Provides validation information about the dataset and calculated statistics.
 * Used by the enhanced calculateStatistics function to track data quality and
 * provide ground truth for LLM validation.
 */
export interface ValidationMetadata {
  calculatedAt: string;
  dataIntegrity: {
    allHaveWACProgramFlag: boolean;
    allHaveWritingCenterFlag: boolean;
    allHaveValidCoordinates: boolean;
    totalRecordsProcessed: number;
  };
  groundTruthCounts: {
    totalInstitutions: number;
    wacPrograms: number;
    writingCenters: number;
    r1Institutions: number;
    r1InstitutionNames: string[];
    carnegieClassifications: number;
    institutionTypes: number;
    statesRepresented: number;
  };
}

/**
 * Enhanced InstitutionStatistics with validation metadata
 *
 * Extends the base statistics interface to include validation metadata
 * for use with LLM validation utilities.
 */
export interface InstitutionStatisticsWithMetadata extends InstitutionStatistics {
  _metadata: ValidationMetadata;
}
