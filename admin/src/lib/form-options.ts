/** Shared select options for Desk / Portal / public start forms. */

export const OPERATOR_TITLE_OPTIONS = [
  "Owner",
  "Operator",
  "Associate",
  "Admin",
] as const;

/** Stored when the visitor leaves timeline/budget undecided (not blank). */
export const NOT_SURE_YET = "Not sure yet";

/** Select sentinel — not stored; shows a free-text field instead. */
export const TIMELINE_MANUAL_VALUE = "__manual__";

export const TIMELINE_OPTIONS = [
  NOT_SURE_YET,
  "1 week",
  "2 weeks",
  "3 weeks",
  "4 weeks",
  "6 weeks",
  "8 weeks",
  "Flexible",
] as const;

/** Ghana cedi ranges for /start, Portal, and Qualify. */
export const BUDGET_OPTIONS = [
  NOT_SURE_YET,
  "Under GH₵5,000",
  "GH₵5,000–10,000",
  "GH₵10,000–25,000",
  "GH₵25,000–50,000",
  "GH₵50,000+",
  "Open / discuss",
] as const;

/** Sources a visitor can pick on /start (not Desk-only markers like inbound). */
export const HEARD_ABOUT_SOURCES = [
  "referral",
  "family_friends",
  "work_colleague",
  "social_media",
  "repeat",
  "other",
] as const;

export type HeardAboutSource = (typeof HEARD_ABOUT_SOURCES)[number];

export function isHeardAboutSource(value: string): value is HeardAboutSource {
  return (HEARD_ABOUT_SOURCES as readonly string[]).includes(value);
}

export function isPresetTimeline(value: string): boolean {
  return (TIMELINE_OPTIONS as readonly string[]).includes(value);
}

/** True when Desk/public should collect a free-text detail for this source. */
export function sourceNeedsDetail(source: string): boolean {
  return source === "other" || source === "social_media";
}
