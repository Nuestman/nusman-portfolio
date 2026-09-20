/** Shared select options for Desk / Portal forms. */

export const OPERATOR_TITLE_OPTIONS = [
  "Owner",
  "Operator",
  "Associate",
  "Admin",
] as const;

export const TIMELINE_OPTIONS = [
  "This week",
  "This month",
  "This quarter",
  "Flexible",
] as const;

export const BUDGET_OPTIONS = [
  "Under $1k",
  "Under $2k",
  "$2k–$5k",
  "$5k+",
  "Open / discuss",
] as const;

/** Sources a visitor can pick on /start (not Desk-only markers). */
export const HEARD_ABOUT_SOURCES = [
  "referral",
  "family_friends",
  "work_colleague",
  "repeat",
  "other",
] as const;

export type HeardAboutSource = (typeof HEARD_ABOUT_SOURCES)[number];

export function isHeardAboutSource(value: string): value is HeardAboutSource {
  return (HEARD_ABOUT_SOURCES as readonly string[]).includes(value);
}
