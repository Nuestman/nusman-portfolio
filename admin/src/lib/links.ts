export type LinkKind =
  | "inline"
  | "back"
  | "table"
  | "nav"
  | "navActive"
  | "chip"
  | "chipActive";

export function linkClassName(kind: LinkKind = "inline"): string {
  switch (kind) {
    case "inline":
      return "cursor-pointer text-gold-500 underline decoration-gold-500/50 underline-offset-2 transition-colors duration-300 hover:text-gold-600 hover:decoration-gold-600";
    case "back":
      return "cursor-pointer text-sm text-gold-500 underline decoration-gold-500/50 underline-offset-2 transition-colors duration-300 hover:text-gold-600 hover:decoration-gold-600";
    case "table":
      return "cursor-pointer font-medium text-gold-500 underline decoration-gold-500/50 underline-offset-2 transition-colors duration-300 hover:text-gold-600 hover:decoration-gold-600";
    case "nav":
      return "cursor-pointer font-heading text-lg font-medium text-dark-950 transition-colors duration-300 hover:text-gold-500";
    case "navActive":
      return "cursor-pointer font-heading text-lg font-medium text-gold-500";
    case "chip":
      return "inline-flex cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-dark-950 hover:border-gold-500 hover:text-gold-600";
    case "chipActive":
      return "inline-flex cursor-pointer rounded-full border border-gold-500 bg-gold-500 px-3 py-1.5 text-sm text-white";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
