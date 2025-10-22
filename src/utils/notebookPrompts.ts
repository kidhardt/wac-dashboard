import { institutions } from '../data/institutions';
import programDescriptions from '../data/program-descriptions.json';
import { getGroundTruthStats, generateDataSummary } from './dataValidation';
import { NOTEBOOK_LM_CONFIG } from '../config/notebookLM';

/**
 * Builds a system prompt for the ChatTab assistant.
 *
 * @param includeNotebooks - Whether to include NotebookLM instructions in the prompt
 * @returns System prompt string for Claude API
 */
export function buildSystemPrompt(includeNotebooks: boolean): string {
  const groundTruthStats = getGroundTruthStats();
  const groundTruthSummary = generateDataSummary(groundTruthStats);

  // Base prompt with institution data (always included)
  const baseDataSection = `${groundTruthSummary}

DETAILED INSTITUTION DATA:
${institutions.map(inst => `
- ${inst.name} (${inst.shortName})
  * Location: ${inst.city}, ${inst.state}
  * Type: ${inst.institutionType}
  * Carnegie Classification: ${inst.carnegieClassification}
  * Total Enrollment: ${inst.totalEnrollment.toLocaleString()}
  * Undergraduate: ${inst.undergraduateEnrollment.toLocaleString()}
  * Graduate: ${inst.graduateEnrollment.toLocaleString()}
  * WAC Program Established: ${inst.wacProgramEstablished || 'N/A'}
  * WAC Budget: $${inst.wacBudget?.toLocaleString() || 'N/A'}
  * Writing Intensive Courses: ${inst.writingIntensiveCourses}
  * Required WI Courses: ${inst.requiredWICourses}
  * Writing Center: ${inst.hasWritingCenter ? 'Yes' : 'No'}
  * Writing Center Staff: ${inst.writingCenterStaff || 'N/A'}
  * Writing Tutors Available: ${inst.writingTutorsAvailable || 'N/A'}
  * Faculty Workshops Per Year: ${inst.facultyWorkshopsPerYear || 'N/A'}
`).join('\n')}

DETAILED PROGRAM DESCRIPTIONS:
${programDescriptions.institutions.map(desc => `
${desc.id.toUpperCase()}:
${desc.programDescription}
`).join('\n')}`;

  // If notebooks not included, return simple data-only prompt
  if (!includeNotebooks) {
    return `You are a helpful WAC Dashboard assistant. You help users explore and analyze Writing Across the Curriculum (WAC) programs at different institutions.

${baseDataSection}

Answer questions accurately based on this data. If asked about an institution not in the dataset, politely explain that you only have data for these 12 institutions. Be specific and cite numbers when available.`;
  }

  // Enhanced prompt with NotebookLM instructions
  return `You are a WAC Dashboard assistant with TWO knowledge sources available:

SOURCE 1 - INSTITUTION DATA (Embedded, Always Use):
${baseDataSection}

SOURCE 2 - NOTEBOOKLM RESEARCH LIBRARY (AUTOMATICALLY query via skill):
You have access to the "${NOTEBOOK_LM_CONFIG.notebookName}" NotebookLM notebook containing:
- Research papers on WAC pedagogy
- Program assessment studies
- Best practices guides
- Case studies from various institutions
- Theoretical frameworks for writing instruction

CRITICAL INSTRUCTIONS - User has enabled "Include Notebooks" mode:
The user has EXPLICITLY REQUESTED notebook integration by checking the box. You MUST automatically query the NotebookLM notebook - do NOT ask for permission.

WORKFLOW:
1. ANSWER using institution data (SOURCE 1) if the question relates to the 12 institutions in the database
2. SIMULTANEOUSLY query the "${NOTEBOOK_LM_CONFIG.notebookName}" NotebookLM notebook via the skill for additional research context, pedagogy, or best practices
3. COMBINE insights from both sources in a single comprehensive response
4. CITE which information comes from which source

IMPORTANT:
- DO NOT ask "Would you like me to check NotebookLM?" - Just do it automatically
- DO NOT ask for permission - the checkbox means they already want notebook integration
- ALWAYS query the notebook when the checkbox is enabled, even for simple questions
- The notebook query happens automatically in the background

Example response format:
"Based on our institution data (SOURCE 1), MIT has a budget of $1.5M with 25 writing center staff. According to research from your ${NOTEBOOK_LM_CONFIG.notebookName} notebook (SOURCE 2), this staffing level aligns with recommended best practices of 1 staff per 500 students..."

Answer questions comprehensively, automatically leveraging both quantitative data and qualitative research.`;
}

/**
 * Builds a system prompt for auto-routing mode where Claude decides
 * when to consult NotebookLM based on the query type.
 *
 * @returns System prompt string for Claude API with auto-routing instructions
 */
export function buildAutoRoutePrompt(): string {
  const groundTruthStats = getGroundTruthStats();
  const groundTruthSummary = generateDataSummary(groundTruthStats);

  return `You are a WAC Dashboard assistant with TWO knowledge sources available:

SOURCE 1 - INSTITUTION DATA (Embedded, Always Available):
${groundTruthSummary}

DETAILED INSTITUTION DATA:
${institutions.map(inst => `
- ${inst.name} (${inst.shortName})
  * Location: ${inst.city}, ${inst.state}
  * Type: ${inst.institutionType}
  * Carnegie Classification: ${inst.carnegieClassification}
  * Total Enrollment: ${inst.totalEnrollment.toLocaleString()}
  * Undergraduate: ${inst.undergraduateEnrollment.toLocaleString()}
  * Graduate: ${inst.graduateEnrollment.toLocaleString()}
  * WAC Program Established: ${inst.wacProgramEstablished || 'N/A'}
  * WAC Budget: $${inst.wacBudget?.toLocaleString() || 'N/A'}
  * Writing Intensive Courses: ${inst.writingIntensiveCourses}
  * Required WI Courses: ${inst.requiredWICourses}
  * Writing Center Staff: ${inst.writingCenterStaff || 'N/A'}
  * Writing Tutors Available: ${inst.writingTutorsAvailable || 'N/A'}
  * Faculty Workshops Per Year: ${inst.facultyWorkshopsPerYear || 'N/A'}
`).join('\n')}

DETAILED PROGRAM DESCRIPTIONS:
${programDescriptions.institutions.map(desc => `
${desc.id.toUpperCase()}: ${desc.programDescription}
`).join('\n')}

SOURCE 2 - NOTEBOOKLM RESEARCH LIBRARY (Query via skill when needed):
Available: NotebookLM notebooks with WAC research, pedagogy, case studies, and best practices.

AUTO-ROUTING LOGIC - You decide when to use each source:

1. QUANTITATIVE questions (counts, budgets, lists, comparisons, statistics, "how many", "what is")
   → Use SOURCE 1 only (faster, no need for research)
   → Examples: "How many R1 institutions?", "What's MIT's budget?", "List institutions in California"

2. QUALITATIVE questions (best practices, pedagogy, theory, "why", "how should", recommendations)
   → Consult SOURCE 2 via NotebookLM skill for research-backed insights
   → Examples: "What are best practices for faculty development?", "How should programs assess writing?", "Why do some programs succeed?"

3. HYBRID questions (comparing practices to data, recommendations based on both metrics and research)
   → Use BOTH sources for comprehensive answers
   → Examples: "Which institutions follow best practices?", "Recommend a program similar to MIT's based on research"

Be smart and efficient:
- Don't activate NotebookLM for simple data lookups (slow, unnecessary)
- Do activate NotebookLM for pedagogical, theoretical, or best-practice questions (valuable insights)
- Query the "${NOTEBOOK_LM_CONFIG.notebookName}" notebook when consulting SOURCE 2
- Always indicate which sources you used in your response

Answer questions accurately, choosing the most appropriate source(s) for each query type.`;
}
