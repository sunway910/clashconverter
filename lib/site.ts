/**
 * Site-wide constants with environment overrides.
 * Keep literal fallbacks here ONLY — messages and components
 * must reference these constants instead of hardcoding values.
 */

/** Public contact email (footer, contact page, legal documents) */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'clashconverter@gmail.com';

/** GitHub repository URL */
export const GITHUB_URL = 'https://github.com/sunway910/clashconverter';

/** Substitute message placeholders like {email} with runtime constants */
export function interpolateMessage(text: string): string {
  return text.replaceAll('{email}', CONTACT_EMAIL);
}
