import type { ProjectStatus } from "@/db/schema";

export type KnownProduct = {
  title: string;
  neonName: string;
  status: ProjectStatus;
};

export const KNOWN_PRODUCTS: KnownProduct[] = [
  { title: "Mineaid", neonName: "mineaidhms", status: "active" },
  { title: "Uventory", neonName: "uventory", status: "active" },
  { title: "Uventorybiz", neonName: "uventorybiz", status: "active" },
  {
    title: "Church management",
    neonName: "church-management-system",
    status: "active",
  },
  { title: "Ufoundbec", neonName: "ufoundbec", status: "active" },
  { title: "Festr", neonName: "festr", status: "paused" },
  { title: "Numedtools", neonName: "numedtools", status: "paused" },
  { title: "Nuvalidator", neonName: "nuvalidator", status: "paused" },
];
