export const fieldClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 placeholder:text-gray-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500";

export const labelClassName = "mb-2 block text-sm font-medium text-dark-950";

export function readTrimmed(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function readOptional(formData: FormData, key: string): string | null {
  const value = readTrimmed(formData, key);
  return value.length > 0 ? value : null;
}

export function readChecked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

export const checkboxClassName =
  "h-4 w-4 rounded border-gray-200 text-gold-500 focus:ring-gold-500";

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
