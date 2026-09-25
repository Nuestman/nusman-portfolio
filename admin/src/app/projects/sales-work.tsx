import { EditableCard } from "@/components/editable-card";
import { InfoList } from "@/components/info-list";
import { displayText } from "@/lib/text";
import type { ProcessGate } from "@/db/schema";
import { IntakeForm } from "./intake-form";
import { DiscoveryForm } from "./discovery-form";

type IntakeRow = {
  theme: string;
  ask: string;
  answer: string | null;
};

export function SalesWork({
  projectId,
  intake,
  discovery,
  include,
}: {
  projectId: string;
  intake: IntakeRow[];
  discovery: {
    callAt: string | null;
    attendees: string | null;
    lastExample: string | null;
    inScope: string | null;
    outOfScope: string | null;
  } | null;
  /** Which process stages to render. */
  include?: readonly ProcessGate[];
}) {
  const show = (gate: ProcessGate) => !include || include.includes(gate);

  const intakeRows = intake.map((item) => ({
    theme: item.theme,
    ask: item.ask,
    answer: item.answer ?? "",
  }));

  return (
    <>
      {show("discover") ? (
        <>
          <EditableCard
            title="Discovery answers"
            hint="The eight themes — fill on Desk after the call."
            view={
              intakeRows.length === 0 ? (
                <p className="text-sm text-gray-600">No discovery themes yet.</p>
              ) : (
                <div className="space-y-4">
                  {intakeRows.map((item) => (
                    <div
                      key={item.theme}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {item.theme}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{item.ask}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-dark-950">
                        {displayText(item.answer)}
                      </p>
                    </div>
                  ))}
                </div>
              )
            }
            form={<IntakeForm projectId={projectId} answers={intakeRows} />}
          />
          <EditableCard
            title="Call notes & scope"
            hint="Lock the problem sentence in Brief before leaving Discover."
            view={
              <InfoList
                items={[
                  { label: "Call", value: discovery?.callAt },
                  { label: "Attendees", value: discovery?.attendees },
                  { label: "Last real example", value: discovery?.lastExample },
                  { label: "In scope", value: discovery?.inScope },
                  { label: "Out of scope", value: discovery?.outOfScope },
                ]}
              />
            }
            form={
              <DiscoveryForm
                projectId={projectId}
                discovery={{
                  callAt: discovery?.callAt ?? "",
                  attendees: discovery?.attendees ?? "",
                  lastExample: discovery?.lastExample ?? "",
                  inScope: discovery?.inScope ?? "",
                  outOfScope: discovery?.outOfScope ?? "",
                }}
              />
            }
          />
        </>
      ) : null}
    </>
  );
}
