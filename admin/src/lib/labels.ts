import {
  USER_ROLES,
  CHANGE_STATUSES,
  CLIENT_SOURCES,
  OPTION_KINDS,
  PERSON_ROLES,
  PROJECT_EVENT_KINDS,
  PROJECT_EVENT_STATUSES,
  PROJECT_STATUSES,
  QUALIFY_OUTCOMES,
  WORK_KINDS,
  type ChangeStatus,
  type ClientSource,
  type OptionKind,
  type PersonRole,
  type ProjectEventKind,
  type ProjectEventStatus,
  type ProjectStatus,
  type QualifyOutcome,
  type UserRole,
  type WorkKind,
} from "@/db/schema";

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
    case "inbound":
      return "Inbound";
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
