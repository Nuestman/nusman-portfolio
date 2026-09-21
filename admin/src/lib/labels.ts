import {
  USER_ROLES,
  CHANGE_STATUSES,
  CLIENT_SOURCES,
  NOTIFICATION_KINDS,
  OPTION_KINDS,
  PERSON_ROLES,
  PROJECT_EVENT_KINDS,
  PROJECT_EVENT_STATUSES,
  PROJECT_STATUSES,
  QUALIFY_OUTCOMES,
  WORK_KINDS,
  type ChangeStatus,
  type ClientSource,
  type NotificationKind,
  type OptionKind,
  type PersonRole,
  type ProjectEventKind,
  type ProjectEventStatus,
  type ProjectStatus,
  type QualifyOutcome,
  type UserRole,
  type WorkKind,
} from "@/db/schema";

export const WANT_BUILT_LABEL = "What we're building";

export function isClientSource(value: string): value is ClientSource {
  return (CLIENT_SOURCES as readonly string[]).includes(value);
}

export function isPersonRole(value: string): value is PersonRole {
  return (PERSON_ROLES as readonly string[]).includes(value);
}

export function clientSourceLabel(source: ClientSource): string {
  switch (source) {
    case "referral":
      return "Referral";
    case "family_friends":
      return "Family / Friend";
    case "work_colleague":
      return "Work colleague";
    case "social_media":
      return "Social media";
    case "inbound":
      return "Inbound / website";
    case "repeat":
      return "Repeat";
    case "other":
      return "Other";
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

export function personRoleLabel(role: PersonRole): string {
  switch (role) {
    case "buyer":
      return "Buyer";
    case "user":
      return "Daily user";
    case "other":
      return "Other";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}

export function projectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case "inactive":
      return "Inactive";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "won":
      return "Won";
    case "lost":
      return "Lost";
    case "done":
      return "Done";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function isWorkKind(value: string): value is WorkKind {
  return (WORK_KINDS as readonly string[]).includes(value);
}

export function workKindLabel(kind: WorkKind): string {
  switch (kind) {
    case "client":
      return "Client job";
    case "product":
      return "Own product";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function isOptionKind(value: string): value is OptionKind {
  return (OPTION_KINDS as readonly string[]).includes(value);
}

export function optionKindLabel(kind: OptionKind): string {
  switch (kind) {
    case "light":
      return "Light";
    case "recommended":
      return "Recommended";
    case "later":
      return "Later";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function isQualifyOutcome(value: string): value is QualifyOutcome {
  return (QUALIFY_OUTCOMES as readonly string[]).includes(value);
}

export function qualifyOutcomeLabel(outcome: QualifyOutcome): string {
  switch (outcome) {
    case "undecided":
      return "Undecided";
    case "real":
      return "Real project";
    case "favour":
      return "Favour";
    case "no":
      return "No";
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
}

export function isChangeStatus(value: string): value is ChangeStatus {
  return (CHANGE_STATUSES as readonly string[]).includes(value);
}

export function changeStatusLabel(status: ChangeStatus): string {
  switch (status) {
    case "parked":
      return "Parked";
    case "priced":
      return "Priced";
    case "done":
      return "Done";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function userRoleLabel(role: UserRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "operator":
      return "Operator";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function isProjectEventKind(value: string): value is ProjectEventKind {
  return (PROJECT_EVENT_KINDS as readonly string[]).includes(value);
}

export function projectEventKindLabel(kind: ProjectEventKind): string {
  switch (kind) {
    case "call":
      return "Call";
    case "meeting":
      return "Meeting";
    case "demo":
      return "Demo";
    case "other":
      return "Other";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function isProjectEventStatus(
  value: string,
): value is ProjectEventStatus {
  return (PROJECT_EVENT_STATUSES as readonly string[]).includes(value);
}

export function projectEventStatusLabel(status: ProjectEventStatus): string {
  switch (status) {
    case "requested":
      return "Requested";
    case "proposed":
      return "Proposed";
    case "confirmed":
      return "Confirmed";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function isNotificationKind(value: string): value is NotificationKind {
  return (NOTIFICATION_KINDS as readonly string[]).includes(value);
}

export function notificationKindLabel(kind: NotificationKind): string {
  switch (kind) {
    case "message":
      return "Message";
    case "schedule":
      return "Schedule";
    case "milestone":
      return "Milestone";
    case "stage":
      return "Stage";
    case "project_started":
      return "Project started";
    case "portal_access":
      return "Portal access";
    case "inbound":
      return "Inbound";
    case "manual":
      return "Notice";
    case "system":
      return "System";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
