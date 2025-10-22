import { Institution, FilterState, SortConfig } from '../types';

/**
 * Filter institutions based on provided filter state
 * Applies all active filters to return matching institutions
 */
export const filterInstitutions = (
  institutions: Institution[],
  filters: FilterState
): Institution[] => {
  return institutions.filter(institution => {
    // Text search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        institution.name,
        institution.shortName,
        institution.city,
        institution.state,
        institution.institutionType,
        institution.carnegieClassification,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // State filter
    if (filters.states.length > 0) {
      if (!filters.states.includes(institution.state)) {
        return false;
      }
    }

    // Institution type filter
    if (filters.institutionTypes.length > 0) {
      if (!filters.institutionTypes.includes(institution.institutionType)) {
        return false;
      }
    }

    // Carnegie classification filter
    if (filters.carnegieClassifications.length > 0) {
      if (!filters.carnegieClassifications.includes(institution.carnegieClassification)) {
        return false;
      }
    }

    // Enrollment range filter
    const { min: minEnroll, max: maxEnroll } = filters.enrollmentRange;
    if (institution.totalEnrollment < minEnroll || institution.totalEnrollment > maxEnroll) {
      return false;
    }

    // WAC program filter
    if (filters.hasWACProgram !== null) {
      if (institution.hasWACProgram !== filters.hasWACProgram) {
        return false;
      }
    }

    // Established year range filter
    if (institution.wacProgramEstablished !== null) {
      const { min: minYear, max: maxYear } = filters.establishedYearRange;
      if (institution.wacProgramEstablished < minYear || institution.wacProgramEstablished > maxYear) {
        return false;
      }
    }

    // Writing center filter
    if (filters.hasWritingCenter !== null) {
      if (institution.hasWritingCenter !== filters.hasWritingCenter) {
        return false;
      }
    }

    // Writing fellows filter
    if (filters.hasWritingFellows !== null) {
      if (institution.writingFellowsProgram !== filters.hasWritingFellows) {
        return false;
      }
    }

    // Faculty development filter
    if (filters.hasFacultyDevelopment !== null) {
      if (institution.writingFacultyDevelopmentProgram !== filters.hasFacultyDevelopment) {
        return false;
      }
    }

    // Budget range filter
    if (institution.wacBudget !== null) {
      const { min: minBudget, max: maxBudget } = filters.budgetRange;
      if (institution.wacBudget < minBudget || institution.wacBudget > maxBudget) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort institutions based on sort configuration
 * Handles different data types (string, number, boolean)
 */
export const sortInstitutions = (
  institutions: Institution[],
  sortConfig: SortConfig
): Institution[] => {
  return [...institutions].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    // Handle null/undefined values - push them to the end
    if (aValue === null || aValue === undefined) {
      return 1;
    }
    if (bValue === null || bValue === undefined) {
      return -1;
    }

    let comparison = 0;

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    }
    // Number comparison
    else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    }
    // Boolean comparison
    else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
    }
    // Object comparison (for coordinates)
    else if (typeof aValue === 'object' && typeof bValue === 'object') {
      // Default to no sorting for objects
      comparison = 0;
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Search institutions by text query
 * Searches across multiple fields
 */
export const searchInstitutions = (
  institutions: Institution[],
  searchTerm: string
): Institution[] => {
  if (!searchTerm.trim()) {
    return institutions;
  }

  const term = searchTerm.toLowerCase();
  return institutions.filter(institution => {
    const searchableFields = [
      institution.name,
      institution.shortName,
      institution.city,
      institution.state,
      institution.institutionType,
      institution.carnegieClassification,
    ];

    return searchableFields.some(field =>
      field.toLowerCase().includes(term)
    );
  });
};

/**
 * Create default filter state
 * Useful for resetting filters
 */
export const createDefaultFilterState = (
  minEnrollment: number = 0,
  maxEnrollment: number = 100000,
  minYear: number = 1970,
  maxYear: number = new Date().getFullYear(),
  minBudget: number = 0,
  maxBudget: number = 2000000
): FilterState => {
  return {
    searchQuery: '',
    states: [],
    institutionTypes: [],
    carnegieClassifications: [],
    enrollmentRange: {
      min: minEnrollment,
      max: maxEnrollment,
    },
    hasWACProgram: null,
    establishedYearRange: {
      min: minYear,
      max: maxYear,
    },
    hasWritingCenter: null,
    hasWritingFellows: null,
    hasFacultyDevelopment: null,
    budgetRange: {
      min: minBudget,
      max: maxBudget,
    },
    // Institution Classification filters
    instSizes: [],
    institutionTypeFundings: [],
    institutionTypeMissions: [],
    termSystems: [],
    writingProgramStructures: [],
    writingProgramAdmins: [],
    // Course Offerings filters
    hasDevRemWriting: null,
    hasFycRequired: null,
    hasStretchFyc: null,
    hasUpperDivWriting: null,
    hasEslUndergradWriting: null,
    hasEslGradWriting: null,
    // Minority-Serving Institution filters
    showOnlyHbcu: false,
    showOnlyHsi: false,
    showOnlyAanapisi: false,
    showOnlyTribal: false,
    showOnlyMsi: false,
  };
};

/**
 * Export institutions data to CSV format
 * Includes all 28 variables
 */
export const exportToCSV = (institutions: Institution[]): string => {
  if (institutions.length === 0) return '';

  // Define headers in a specific order for readability
  const headers = [
    'id',
    'name',
    'shortName',
    'state',
    'city',
    'latitude',
    'longitude',
    'institutionType',
    'carnegieClassification',
    'totalEnrollment',
    'undergraduateEnrollment',
    'graduateEnrollment',
    'foundedYear',
    'hasWACProgram',
    'wacProgramEstablished',
    'wacDirectorPosition',
    'wacFacultyFTE',
    'wacBudget',
    'writingIntensiveCourses',
    'requiredWICourses',
    'wacWebsiteUrl',
    'hasWritingCenter',
    'writingCenterStaff',
    'writingCenterHoursPerWeek',
    'writingFellowsProgram',
    'writingTutorsAvailable',
    'facultyWorkshopsPerYear',
    'writingFacultyDevelopmentProgram',
    'crossDisciplinaryWritingInitiatives',
  ];

  // Create CSV header row
  const csvHeaders = headers.join(',');

  // Create CSV data rows
  const csvRows = institutions.map(institution => {
    return headers.map(header => {
      let value: any;

      // Handle special cases
      if (header === 'latitude') {
        value = institution.coordinates.lat;
      } else if (header === 'longitude') {
        value = institution.coordinates.lng;
      } else {
        value = institution[header as keyof Institution];
      }

      // Format value for CSV
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Export institutions data to JSON format
 */
export const exportToJSON = (institutions: Institution[]): string => {
  return JSON.stringify(institutions, null, 2);
};

/**
 * Download data as a file
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export institutions to CSV file
 */
export const exportInstitutionsToCSV = (institutions: Institution[]) => {
  const csv = exportToCSV(institutions);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `wac-institutions-${timestamp}.csv`, 'text/csv');
};

/**
 * Export institutions to JSON file
 */
export const exportInstitutionsToJSON = (institutions: Institution[]) => {
  const json = exportToJSON(institutions);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `wac-institutions-${timestamp}.json`, 'application/json');
};

/**
 * Compare two institutions and return differences
 * Useful for comparison view
 */
export const compareInstitutions = (
  inst1: Institution,
  inst2: Institution,
  fields: (keyof Institution)[]
): Record<string, { inst1: any; inst2: any; different: boolean }> => {
  const comparison: Record<string, { inst1: any; inst2: any; different: boolean }> = {};

  fields.forEach(field => {
    const value1 = inst1[field];
    const value2 = inst2[field];
    
    comparison[field] = {
      inst1: value1,
      inst2: value2,
      different: JSON.stringify(value1) !== JSON.stringify(value2),
    };
  });

  return comparison;
};

/**
 * Get field label for display
 * Converts camelCase to Title Case with spaces
 */
export const getFieldLabel = (field: keyof Institution): string => {
  const labels: Partial<Record<keyof Institution, string>> = {
    id: 'ID',
    shortName: 'Short Name',
    institutionType: 'Institution Type',
    carnegieClassification: 'Carnegie Classification',
    totalEnrollment: 'Total Enrollment',
    undergraduateEnrollment: 'Undergraduate Enrollment',
    graduateEnrollment: 'Graduate Enrollment',
    foundedYear: 'Founded Year',
    hasWACProgram: 'Has WAC Program',
    wacProgramEstablished: 'WAC Program Established',
    wacDirectorPosition: 'Has WAC Director',
    wacFacultyFTE: 'WAC Faculty FTE',
    wacBudget: 'WAC Annual Budget',
    writingIntensiveCourses: 'Writing Intensive Courses',
    requiredWICourses: 'Required WI Courses',
    wacWebsiteUrl: 'WAC Website',
    hasWritingCenter: 'Has Writing Center',
    writingCenterStaff: 'Writing Center Staff',
    writingCenterHoursPerWeek: 'Writing Center Hours/Week',
    writingFellowsProgram: 'Writing Fellows Program',
    writingTutorsAvailable: 'Writing Tutors Available',
    facultyWorkshopsPerYear: 'Faculty Workshops/Year',
    writingFacultyDevelopmentProgram: 'Faculty Development Program',
    crossDisciplinaryWritingInitiatives: 'Cross-Disciplinary Initiatives',
  };

  return labels[field] || field.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Format value for display
 */
export const formatValue = (value: any, field: keyof Institution): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Budget formatting
  if (field === 'wacBudget' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  }

  // Number formatting with commas
  if (typeof value === 'number' && ['totalEnrollment', 'undergraduateEnrollment', 'graduateEnrollment'].includes(field)) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  // URL formatting
  if (field === 'wacWebsiteUrl' && typeof value === 'string') {
    return value;
  }

  return String(value);
};
