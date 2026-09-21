export const tableFrameClassName =
  "overflow-x-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm";

export const tableClassName = "desk-table";

export function inactiveRowProps(inactive: boolean) {
  return inactive ? ({ "data-inactive": true } as const) : {};
}
