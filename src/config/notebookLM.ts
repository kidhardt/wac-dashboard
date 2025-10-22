/**
 * NotebookLM Feature Configuration
 *
 * This file controls how the ChatTab integrates with NotebookLM for research insights.
 *
 * HOW TO CHANGE MODES:
 * Change the 'mode' property in NOTEBOOK_LM_CONFIG below to one of three values:
 *
 * 1. 'disabled' - NotebookLM is not used at all
 *    - Checkbox hidden from UI
 *    - Only institution data used for responses
 *    - Fastest response times (~2 seconds)
 *    - No browser automation
 *
 * 2. 'user-controlled' - User decides via checkbox (DEFAULT)
 *    - Checkbox visible in chat UI
 *    - Unchecked = institution data only (fast)
 *    - Checked = includes NotebookLM research (slower, ~8-12 seconds)
 *    - User has full control
 *
 * 3. 'auto-route' - Claude automatically decides
 *    - Checkbox hidden from UI
 *    - Claude routes based on query type:
 *      * Quantitative questions (counts, budgets) → institution data only
 *      * Qualitative questions (best practices, pedagogy) → includes NotebookLM
 *    - Intelligent but less predictable
 */

export type NotebookLMMode = 'disabled' | 'user-controlled' | 'auto-route';

export interface NotebookLMConfig {
  /**
   * Current mode - controls NotebookLM integration behavior
   */
  mode: NotebookLMMode;

  /**
   * Name of the NotebookLM notebook to query
   */
  notebookName: string;

  /**
   * Max tokens for responses that include NotebookLM research
   */
  maxTokensWithNotebooks: number;

  /**
   * Max tokens for responses using only institution data
   */
  maxTokensWithoutNotebooks: number;

  /**
   * Whether to display source badges on chat messages
   */
  enableSourceBadges: boolean;
}

// ============================================
// MAIN CONFIGURATION
// ============================================
// Change the 'mode' value below to switch between modes:
// - 'disabled'
// - 'user-controlled' (default)
// - 'auto-route'
// ============================================

export const NOTEBOOK_LM_CONFIG: NotebookLMConfig = {
  mode: 'user-controlled',  // <-- CHANGE THIS LINE TO SWITCH MODES
  notebookName: 'Writing Sites',  // Registered notebook name in NotebookLM skill
  maxTokensWithNotebooks: 2000,
  maxTokensWithoutNotebooks: 1000,
  enableSourceBadges: true,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if NotebookLM is completely disabled
 */
export const isNotebookLMDisabled = (): boolean => {
  return NOTEBOOK_LM_CONFIG.mode === 'disabled';
};

/**
 * Check if mode is user-controlled (checkbox visible)
 */
export const isUserControlled = (): boolean => {
  return NOTEBOOK_LM_CONFIG.mode === 'user-controlled';
};

/**
 * Check if mode is auto-route (Claude decides)
 */
export const isAutoRoute = (): boolean => {
  return NOTEBOOK_LM_CONFIG.mode === 'auto-route';
};

/**
 * Get display name for current mode
 */
export const getModeName = (): string => {
  switch (NOTEBOOK_LM_CONFIG.mode) {
    case 'disabled':
      return 'Disabled (Data Only)';
    case 'user-controlled':
      return 'User-Controlled';
    case 'auto-route':
      return 'Auto-Route';
    default:
      return 'Unknown';
  }
};
