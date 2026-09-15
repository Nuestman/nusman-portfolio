import { displayText } from "@/lib/text";

export function InfoList({
  items,
}: {
  items: Array<{ label: string; value: string | null | undefined }>;
}) {
  return (
    <dl className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm font-medium text-dark-950">{item.label}</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
            {displayText(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
