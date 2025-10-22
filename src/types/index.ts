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

  // Institution Classification
  instSize: "extraSmall" | "small" | "medium" | "large" | "extraLarge";
  institutionTypeFunding: "publicUniversity" | "privateUniversity" | "communityCollege" | "militaryAcademy" | "religiousAffiliated";
  institutionTypeMission: "liberalArts" | "research" | "teaching" | "professionalTraining" | "onlineEducation" | "specialized" | "graduateEducation" | "militaryTraining";
  institutionTypeReligious: "catholicConsortium" | "seminariesBibleCollege" | "denominationAffiliated" | "nonReligious" | null;
  institutionTypeSpecialization: "artDesignSchool" | "musicPerformingArtsSchool" | "otherProfessionalSchool" | "technicalTradeSchool" | "generalist";

  // WAC Program Details (8 variables)
  hasWACProgram: boolean;
  wacProgramEstablished: number | null;
  wacDirectorPosition: boolean;
  wacFacultyFTE: number;
  wacBudget: number | null; // Annual budget in USD
  writingIntensiveCourses: number;
  requiredWICourses: number;
  wacWebsiteUrl: string;

  // Program Structure
  termSystem: "semester" | "quarter" | null;
  writingProgramStructure: "independentWritingProgram" | "embeddedInLiteratureDept" | "embeddedInOtherDept" | null;
  writingProgramAdmin: "oneFormalWpa" | "multipleDirectors" | "noFormalAdministrator" | null;
  instructorTraining: "teachingTrainingPracticum" | "l2TeacherTrainingPracticum" | "teachingTrainingPracticumAndL2" | "noFormalTraining" | null;

  // Placement and Assessment
  dspUsage: "exclusivelyDsp" | "utilizesDspNotExclusively" | "dspComponentAlongsideOther" | "otherMeasuresInformedByDsp" | "notUsingButConsidering" | "notUsingNoPlans" | null;

  // Class Size Caps
  fycCap: "fycc12-15" | "fycc16-20" | "fycc21-25" | "fycc26-30" | "fycc31+" | null;
  upperDivCap: "udc12-15" | "udc16-20" | "udc21-25" | "udc26-30" | "udc31+" | null;
  basicCap: "bcc12-15" | "bcc16-20" | "bcc21-25" | "bcc26-30" | "bcc31+" | null;

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

  // Faculty Composition
  ttFacultyPercentage: "tt0" | "tt1-5" | "tt5-10" | "tt10-20" | "tt20+" | null;
  ftFacultyPercentage: "ft0" | "ft1-10" | "ft11-30" | "ft31-50" | "ft51-70" | "ft71-90" | "ft90+" | null;
  partTimerPercentage: "0-10" | "10-20" | "20-40" | "40-60" | "60-70" | "70-80" | "80-90" | "90-100" | null;

  // Course Offerings
  devRemWriting: boolean | null;
  fycRequired: boolean | null;
  stretchFyc: boolean | null;
  upperDivWriting: boolean | null;
  writingIntensiveOffered: boolean | null;
  gradWritingCourse: boolean | null;
  eslUndergradWriting: boolean | null;
  eslGradWriting: boolean | null;
  otherEslClasses: boolean | null;

  // WPA Credentials
  wpaDoctoral: boolean | null;
  wpaMasters: boolean | null;
  wpaRhetComp: boolean | null;
  wpaLinguisticsTesol: boolean | null;
  wpaEducation: boolean | null;
  wpaLiterature: boolean | null;
  wpaPhilosophy: boolean | null;
  wpaTESOLCertificate: boolean | null;
  wpaCreativeWriting: boolean | null;

  // Minority-Serving Institutions
  instMinTypeHbcu: boolean;
  instMinTypeHsi: boolean;
  instMinTypeAanapisi: boolean;
  instMinTypeTribal: boolean;
  instMinTypeOtherMsi: boolean;
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

  // Institution Classification filters
  instSizes: ("extraSmall" | "small" | "medium" | "large" | "extraLarge")[];
  institutionTypeFundings: ("publicUniversity" | "privateUniversity" | "communityCollege" | "militaryAcademy" | "religiousAffiliated")[];
  institutionTypeMissions: ("liberalArts" | "research" | "teaching" | "professionalTraining" | "onlineEducation" | "specialized" | "graduateEducation" | "militaryTraining")[];
  termSystems: ("semester" | "quarter")[];
  writingProgramStructures: ("independentWritingProgram" | "embeddedInLiteratureDept" | "embeddedInOtherDept")[];
  writingProgramAdmins: ("oneFormalWpa" | "multipleDirectors" | "noFormalAdministrator")[];

  // Course Offerings filters
  hasDevRemWriting: boolean | null;
  hasFycRequired: boolean | null;
  hasStretchFyc: boolean | null;
  hasUpperDivWriting: boolean | null;
  hasEslUndergradWriting: boolean | null;
  hasEslGradWriting: boolean | null;

  // Minority-Serving Institution filters
  showOnlyHbcu: boolean;
  showOnlyHsi: boolean;
  showOnlyAanapisi: boolean;
  showOnlyTribal: boolean;
  showOnlyMsi: boolean;
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
