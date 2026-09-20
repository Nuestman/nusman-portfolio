import { displayText } from "@/lib/text";

function BriefEyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
      {children}
    </p>
  );
}

function BriefSection({
  label,
  value,
  lead = false,
}: {
  label: string;
  value: string | null | undefined;
  lead?: boolean;
}) {
  const text = value?.trim() ?? "";
  return (
    <div>
      <BriefEyebrow>{label}</BriefEyebrow>
      {text ? (
        <p
          className={
            lead
              ? "mt-2 font-heading text-3xl leading-snug text-dark-950"
              : "mt-2 whitespace-pre-wrap text-base leading-relaxed text-dark-950"
          }
        >
          {text}
        </p>
      ) : (
        <p className="mt-2 text-base text-gray-500">{displayText(null)}</p>
      )}
    </div>
  );
}

export function PortalProjectBrief({
  problem,
  success,
  inScope,
  outOfScope,
  deadline,
  packageName,
}: {
  problem: string | null;
  success: string | null;
  inScope: string | null;
  outOfScope: string | null;
  deadline: string | null;
  packageName: string | null;
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <BriefSection label="Package" value={packageName} />
        <BriefSection label="Deadline" value={deadline} />
      </div>

      <BriefSection label="Problem" value={problem} lead />
      <BriefSection label="Success looks like" value={success} />

      <div className="grid gap-5 rounded-2xl border border-gold-100 bg-gold-50/60 p-5 sm:grid-cols-2">
        <BriefSection label="In scope" value={inScope} />
        <BriefSection label="Out of scope" value={outOfScope} />
      </div>
    </div>
  );
}
