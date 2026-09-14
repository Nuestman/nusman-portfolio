import {
  CLIENT_SOURCES,
  PERSON_ROLES,
  type ClientSource,
  type PersonRole,
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
