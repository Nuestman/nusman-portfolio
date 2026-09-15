import { EditableCard } from "@/components/editable-card";
import { InfoList } from "@/components/info-list";
import { qualifyOutcomeLabel } from "@/lib/labels";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { displayText } from "@/lib/text";
import type { QualifyOutcome } from "@/db/schema";
import { QualifyForm } from "./qualify-form";
import { IntakeForm } from "./intake-form";
import { DiscoveryForm } from "./discovery-form";

type IntakeRow = {
  theme: string;
  ask: string;
  answer: string | null;
};

export function SalesWork({
  projectId,
  qualify,
  intake,
  discovery,
}: {
  projectId: string;
  qualify: {
    outcome: QualifyOutcome;
    whoFor: string | null;
    painToday: string | null;
    neededBy: string | null;
    callAt: string | null;
    notes: string | null;
  } | null;
  intake: IntakeRow[];
  discovery: {
    callAt: string | null;
    attendees: string | null;
    currentProcess: string | null;
    lastExample: string | null;
    inScope: string | null;
    outOfScope: string | null;
    devicesLanguage: string | null;
    privacyNotes: string | null;
  } | null;
}) {
  const intakeRows = intake.map((item) => ({
    theme: item.theme,
    ask: item.ask,
    answer: item.answer ?? "",
  }));

  return (
    <>
      <EditableCard
        title="Qualify"
        hint="15-minute screen. Outcome must be a real project before you leave this gate."
        view={
          <InfoList
            items={[
              {
                label: "Outcome",
                value: qualifyOutcomeLabel(qualify?.outcome ?? "undecided"),
              },
              { label: "Who it is for", value: qualify?.whoFor },
              { label: "What is painful today", value: qualify?.painToday },
              { label: "Needed by", value: qualify?.neededBy },
              { label: "15-min call", value: qualify?.callAt },
              { label: "Notes", value: qualify?.notes },
            ]}
          />
        }
        form={
          <QualifyForm
            projectId={projectId}
            qualify={{
              outcome: qualify?.outcome ?? "undecided",
              whoFor: qualify?.whoFor ?? "",
              painToday: qualify?.painToday ?? "",
              neededBy: qualify?.neededBy ?? "",
              callAt: qualify?.callAt ?? "",
              notes: qualify?.notes ?? "",
            }}
          />
        }
      />

      <EditableCard
        title="Intake"
        hint="The eight questions. Problem and Success are needed before you leave Intake."
        view={
          intakeRows.length === 0 ? (
            <p className="text-sm text-gray-600">No intake questions yet.</p>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Theme</th>
                    <th className="px-4 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {intakeRows.map((item) => (
                    <tr key={item.theme} className="border-t border-gray-100">
                      <td className="px-4 py-3 align-top font-medium text-dark-950">
                        {item.theme}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {item.ask}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {displayText(item.answer)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        form={<IntakeForm projectId={projectId} answers={intakeRows} />}
      />

      <EditableCard
        title="Discover"
        hint="Call notes. Write the problem sentence on the project before you leave Discover."
        view={
          <InfoList
            items={[
              { label: "Call", value: discovery?.callAt },
              { label: "Attendees", value: discovery?.attendees },
              { label: "Current process", value: discovery?.currentProcess },
              { label: "Last real example", value: discovery?.lastExample },
              { label: "In scope", value: discovery?.inScope },
              { label: "Out of scope", value: discovery?.outOfScope },
              {
                label: "Devices, language, literacy",
                value: discovery?.devicesLanguage,
              },
              { label: "Privacy", value: discovery?.privacyNotes },
            ]}
          />
        }
        form={
          <DiscoveryForm
            projectId={projectId}
            discovery={{
              callAt: discovery?.callAt ?? "",
              attendees: discovery?.attendees ?? "",
              currentProcess: discovery?.currentProcess ?? "",
              lastExample: discovery?.lastExample ?? "",
              inScope: discovery?.inScope ?? "",
              outOfScope: discovery?.outOfScope ?? "",
              devicesLanguage: discovery?.devicesLanguage ?? "",
              privacyNotes: discovery?.privacyNotes ?? "",
            }}
          />
        }
      />
    </>
  );
}
