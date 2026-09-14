import {
  CLIENT_SOURCES,
  OPTION_KINDS,
  PERSON_ROLES,
  PROJECT_STATUSES,
  type ClientSource,
  type OptionKind,
  type PersonRole,
  type ProjectStatus,
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
