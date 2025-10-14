import { Institution } from '../types';

/**
 * Complete dataset of 12 institutions with WAC programs
 * Data represents a diverse sample across different institution types,
 * geographic regions, and WAC program structures
 */
export const institutions: Institution[] = [
  {
    id: 'uc-berkeley',
    name: 'University of California, Berkeley',
    shortName: 'UC Berkeley',
    state: 'California',
    city: 'Berkeley',
    coordinates: {
      lat: 37.8719,
      lng: -122.2585,
    },
    institutionType: 'public',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 45057,
    undergraduateEnrollment: 31814,
    graduateEnrollment: 13243,
    foundedYear: 1868,
    hasWACProgram: true,
    wacProgramEstablished: 1982,
    wacProgramType: 'distributed',
    wacDirectorPosition: true,
    wacFacultyFTE: 3.5,
    wacBudget: 850000,
    writingIntensiveCourses: 247,
    requiredWICourses: 2,
    wacWebsiteUrl: 'https://writing.berkeley.edu',
    hasWritingCenter: true,
    writingCenterStaff: 18,
    writingCenterHoursPerWeek: 60,
    writingFellowsProgram: true,
    writingTutorsAvailable: 45,
    facultyWorkshopsPerYear: 12,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'duke-university',
    name: 'Duke University',
    shortName: 'Duke',
    state: 'North Carolina',
    city: 'Durham',
    coordinates: {
      lat: 36.0014,
      lng: -78.9382,
    },
    institutionType: 'private',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 16606,
    undergraduateEnrollment: 6883,
    graduateEnrollment: 9723,
    foundedYear: 1838,
    hasWACProgram: true,
    wacProgramEstablished: 1987,
    wacProgramType: 'centralized',
    wacDirectorPosition: true,
    wacFacultyFTE: 4.0,
    wacBudget: 1200000,
    writingIntensiveCourses: 189,
    requiredWICourses: 3,
    wacWebsiteUrl: 'https://twp.duke.edu',
    hasWritingCenter: true,
    writingCenterStaff: 22,
    writingCenterHoursPerWeek: 70,
    writingFellowsProgram: true,
    writingTutorsAvailable: 58,
    facultyWorkshopsPerYear: 16,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'texas-am',
    name: 'Texas A&M University',
    shortName: 'Texas A&M',
    state: 'Texas',
    city: 'College Station',
    coordinates: {
      lat: 30.6187,
      lng: -96.3365,
    },
    institutionType: 'public',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 74014,
    undergraduateEnrollment: 58515,
    graduateEnrollment: 15499,
    foundedYear: 1876,
    hasWACProgram: true,
    wacProgramEstablished: 1991,
    wacProgramType: 'hybrid',
    wacDirectorPosition: true,
    wacFacultyFTE: 2.5,
    wacBudget: 650000,
    writingIntensiveCourses: 312,
    requiredWICourses: 2,
    wacWebsiteUrl: 'https://writingcenter.tamu.edu',
    hasWritingCenter: true,
    writingCenterStaff: 15,
    writingCenterHoursPerWeek: 55,
    writingFellowsProgram: true,
    writingTutorsAvailable: 42,
    facultyWorkshopsPerYear: 10,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    shortName: 'MIT',
    state: 'Massachusetts',
    city: 'Cambridge',
    coordinates: {
      lat: 42.3601,
      lng: -71.0942,
    },
    institutionType: 'private',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 11934,
    undergraduateEnrollment: 4638,
    graduateEnrollment: 7296,
    foundedYear: 1861,
    hasWACProgram: true,
    wacProgramEstablished: 1979,
    wacProgramType: 'centralized',
    wacDirectorPosition: true,
    wacFacultyFTE: 5.0,
    wacBudget: 1500000,
    writingIntensiveCourses: 156,
    requiredWICourses: 4,
    wacWebsiteUrl: 'https://cmsw.mit.edu/writing-and-communication-center/',
    hasWritingCenter: true,
    writingCenterStaff: 25,
    writingCenterHoursPerWeek: 80,
    writingFellowsProgram: true,
    writingTutorsAvailable: 62,
    facultyWorkshopsPerYear: 20,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'umich',
    name: 'University of Michigan',
    shortName: 'Michigan',
    state: 'Michigan',
    city: 'Ann Arbor',
    coordinates: {
      lat: 42.2780,
      lng: -83.7382,
    },
    institutionType: 'public',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 51225,
    undergraduateEnrollment: 32282,
    graduateEnrollment: 18943,
    foundedYear: 1817,
    hasWACProgram: true,
    wacProgramEstablished: 1985,
    wacProgramType: 'distributed',
    wacDirectorPosition: true,
    wacFacultyFTE: 3.0,
    wacBudget: 920000,
    writingIntensiveCourses: 278,
    requiredWICourses: 2,
    wacWebsiteUrl: 'https://lsa.umich.edu/sweetland',
    hasWritingCenter: true,
    writingCenterStaff: 20,
    writingCenterHoursPerWeek: 65,
    writingFellowsProgram: true,
    writingTutorsAvailable: 52,
    facultyWorkshopsPerYear: 14,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'emory',
    name: 'Emory University',
    shortName: 'Emory',
    state: 'Georgia',
    city: 'Atlanta',
    coordinates: {
      lat: 33.7920,
      lng: -84.3230,
    },
    institutionType: 'private',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 15942,
    undergraduateEnrollment: 7101,
    graduateEnrollment: 8841,
    foundedYear: 1836,
    hasWACProgram: true,
    wacProgramEstablished: 1993,
    wacProgramType: 'hybrid',
    wacDirectorPosition: true,
    wacFacultyFTE: 2.8,
    wacBudget: 780000,
    writingIntensiveCourses: 164,
    requiredWICourses: 3,
    wacWebsiteUrl: 'https://writingcenter.emory.edu',
    hasWritingCenter: true,
    writingCenterStaff: 16,
    writingCenterHoursPerWeek: 60,
    writingFellowsProgram: true,
    writingTutorsAvailable: 38,
    facultyWorkshopsPerYear: 12,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'portland-state',
    name: 'Portland State University',
    shortName: 'Portland State',
    state: 'Oregon',
    city: 'Portland',
    coordinates: {
      lat: 45.5122,
      lng: -122.6587,
    },
    institutionType: 'public',
    carnegieClassification: 'R2: Doctoral Universities – High Research Activity',
    totalEnrollment: 21609,
    undergraduateEnrollment: 17500,
    graduateEnrollment: 4109,
    foundedYear: 1946,
    hasWACProgram: true,
    wacProgramEstablished: 1996,
    wacProgramType: 'distributed',
    wacDirectorPosition: true,
    wacFacultyFTE: 2.0,
    wacBudget: 420000,
    writingIntensiveCourses: 145,
    requiredWICourses: 2,
    wacWebsiteUrl: 'https://www.pdx.edu/writing-center',
    hasWritingCenter: true,
    writingCenterStaff: 12,
    writingCenterHoursPerWeek: 50,
    writingFellowsProgram: true,
    writingTutorsAvailable: 28,
    facultyWorkshopsPerYear: 8,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'lafayette',
    name: 'Lafayette College',
    shortName: 'Lafayette',
    state: 'Pennsylvania',
    city: 'Easton',
    coordinates: {
      lat: 40.7009,
      lng: -75.2085,
    },
    institutionType: 'private',
    carnegieClassification: 'Baccalaureate Colleges: Arts & Sciences Focus',
    totalEnrollment: 2698,
    undergraduateEnrollment: 2698,
    graduateEnrollment: 0,
    foundedYear: 1826,
    hasWACProgram: true,
    wacProgramEstablished: 1988,
    wacProgramType: 'centralized',
    wacDirectorPosition: true,
    wacFacultyFTE: 1.5,
    wacBudget: 280000,
    writingIntensiveCourses: 87,
    requiredWICourses: 3,
    wacWebsiteUrl: 'https://writing.lafayette.edu',
    hasWritingCenter: true,
    writingCenterStaff: 8,
    writingCenterHoursPerWeek: 45,
    writingFellowsProgram: true,
    writingTutorsAvailable: 22,
    facultyWorkshopsPerYear: 10,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'arizona-state',
    name: 'Arizona State University',
    shortName: 'ASU',
    state: 'Arizona',
    city: 'Tempe',
    coordinates: {
      lat: 33.4242,
      lng: -111.9281,
    },
    institutionType: 'public',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 80065,
    undergraduateEnrollment: 65492,
    graduateEnrollment: 14573,
    foundedYear: 1885,
    hasWACProgram: true,
    wacProgramEstablished: 1994,
    wacProgramType: 'hybrid',
    wacDirectorPosition: true,
    wacFacultyFTE: 4.5,
    wacBudget: 1100000,
    writingIntensiveCourses: 356,
    requiredWICourses: 2,
    wacWebsiteUrl: 'https://writing.asu.edu',
    hasWritingCenter: true,
    writingCenterStaff: 24,
    writingCenterHoursPerWeek: 75,
    writingFellowsProgram: true,
    writingTutorsAvailable: 68,
    facultyWorkshopsPerYear: 18,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'carleton',
    name: 'Carleton College',
    shortName: 'Carleton',
    state: 'Minnesota',
    city: 'Northfield',
    coordinates: {
      lat: 44.4619,
      lng: -93.1540,
    },
    institutionType: 'private',
    carnegieClassification: 'Baccalaureate Colleges: Arts & Sciences Focus',
    totalEnrollment: 2045,
    undergraduateEnrollment: 2045,
    graduateEnrollment: 0,
    foundedYear: 1866,
    hasWACProgram: true,
    wacProgramEstablished: 1986,
    wacProgramType: 'distributed',
    wacDirectorPosition: true,
    wacFacultyFTE: 1.2,
    wacBudget: 240000,
    writingIntensiveCourses: 72,
    requiredWICourses: 4,
    wacWebsiteUrl: 'https://www.carleton.edu/writing',
    hasWritingCenter: true,
    writingCenterStaff: 6,
    writingCenterHoursPerWeek: 40,
    writingFellowsProgram: true,
    writingTutorsAvailable: 18,
    facultyWorkshopsPerYear: 8,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'george-mason',
    name: 'George Mason University',
    shortName: 'GMU',
    state: 'Virginia',
    city: 'Fairfax',
    coordinates: {
      lat: 38.8289,
      lng: -77.3067,
    },
    institutionType: 'public',
    carnegieClassification: 'R1: Doctoral Universities – Very High Research Activity',
    totalEnrollment: 39817,
    undergraduateEnrollment: 27192,
    graduateEnrollment: 12625,
    foundedYear: 1957,
    hasWACProgram: true,
    wacProgramEstablished: 1998,
    wacProgramType: 'hybrid',
    wacDirectorPosition: true,
    wacFacultyFTE: 2.3,
    wacBudget: 550000,
    writingIntensiveCourses: 198,
    requiredWICourses: 2,
    wacWebsiteUrl: 'https://writingcenter.gmu.edu',
    hasWritingCenter: true,
    writingCenterStaff: 14,
    writingCenterHoursPerWeek: 58,
    writingFellowsProgram: true,
    writingTutorsAvailable: 35,
    facultyWorkshopsPerYear: 11,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
  {
    id: 'miami-dade',
    name: 'Miami Dade College',
    shortName: 'MDC',
    state: 'Florida',
    city: 'Miami',
    coordinates: {
      lat: 25.7743,
      lng: -80.1937,
    },
    institutionType: 'community',
    carnegieClassification: 'Associate\'s Colleges: High Transfer-High Traditional',
    totalEnrollment: 49925,
    undergraduateEnrollment: 49925,
    graduateEnrollment: 0,
    foundedYear: 1959,
    hasWACProgram: true,
    wacProgramEstablished: 2002,
    wacProgramType: 'centralized',
    wacDirectorPosition: true,
    wacFacultyFTE: 1.8,
    wacBudget: 320000,
    writingIntensiveCourses: 134,
    requiredWICourses: 1,
    wacWebsiteUrl: 'https://www.mdc.edu/writingcenter',
    hasWritingCenter: true,
    writingCenterStaff: 16,
    writingCenterHoursPerWeek: 65,
    writingFellowsProgram: false,
    writingTutorsAvailable: 44,
    facultyWorkshopsPerYear: 9,
    writingFacultyDevelopmentProgram: true,
    crossDisciplinaryWritingInitiatives: true,
  },
];

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
 * Helper function to get unique Carnegie classifications
 */
export const getCarnegieClassifications = (): string[] => {
  return Array.from(new Set(institutions.map(inst => inst.carnegieClassification))).sort();
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
  
  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
};

/**
 * Helper function to get unique WAC program types
 */
export const getWACProgramTypes = (): ('centralized' | 'distributed' | 'hybrid' | 'none')[] => {
  return Array.from(new Set(institutions.map(inst => inst.wacProgramType)));
};

/**
 * Calculate statistics across all institutions
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
  
  const totalWICourses = institutionList.reduce(
    (sum, i) => sum + i.writingIntensiveCourses, 
    0
  );
  
  return {
    totalInstitutions: total,
    withWACPrograms: withWAC,
    withWritingCenters: withWritingCenter,
    averageEnrollment: avgEnrollment,
    averageWACBudget: avgBudget,
    totalWritingIntensiveCourses: totalWICourses,
    institutionsByType: institutionList.reduce((acc, i) => {
      acc[i.institutionType] = (acc[i.institutionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    institutionsByState: institutionList.reduce((acc, i) => {
      acc[i.state] = (acc[i.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    wacProgramsByType: institutionList.reduce((acc, i) => {
      acc[i.wacProgramType] = (acc[i.wacProgramType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
};
