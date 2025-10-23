/**
 * Feature Flags Configuration
 *
 * Central location for enabling/disabling application features.
 * This makes it easy to toggle features without modifying component code.
 *
 * @module config/features
 */

/**
 * Chat Feature Flag
 *
 * Controls whether the chat functionality is enabled or disabled.
 *
 * When ENABLED (true):
 * - Full chat interface with input, send button, and API integration
 * - Users can interact with the AI assistant
 * - Requires valid API configuration (see src/config/api.ts)
 *
 * When DISABLED (false):
 * - Shows "Coming Soon" message
 * - Chat input and send button are hidden
 * - No API calls are made
 *
 * TO REACTIVATE CHAT:
 * Simply change this value to `true` and rebuild the application.
 * No other code changes are required.
 *
 * @default true - Currently enabled
 */
export const CHAT_ENABLED = true;

/**
 * Feature flag interface for type safety
 */
export interface FeatureFlags {
  chatEnabled: boolean;
}

/**
 * Get all feature flags
 * @returns Current feature flag configuration
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    chatEnabled: CHAT_ENABLED,
  };
}

/**
 * Check if chat is enabled
 * @returns true if chat feature is enabled
 */
export function isChatEnabled(): boolean {
  return CHAT_ENABLED;
}
