import { EditableCard } from "@/components/editable-card";
import { InfoList } from "@/components/info-list";
import { displayYesNo } from "@/lib/text";
import { AGREEMENT_CLAUSES } from "@/lib/templates";
import type { OptionKind, ProjectGate } from "@/db/schema";
import { OptionsPanel } from "./options-panel";
import { AgreementForm } from "./agreement-form";

type OptionRow = {
  id: string;
  kind: OptionKind;
  summary: string;
  priceNote: string | null;
  timelineNote: string | null;
  inScope: string | null;
  outOfScope: string | null;
  selected: boolean;
};

type ClauseField =
  | "parties"
  | "outcome"
  | "scope"
  | "money"
  | "time"
  | "changes"
  | "support"
  | "workplace";

function clauseField(
  clause: (typeof AGREEMENT_CLAUSES)[number]["clause"],
): ClauseField {
  switch (clause) {
    case "Parties":
      return "parties";
    case "Outcome":
      return "outcome";
    case "Scope":
      return "scope";
    case "Money":
      return "money";
    case "Time":
      return "time";
    case "Changes":
      return "changes";
    case "Support":
      return "support";
    case "Workplace":
      return "workplace";
    default: {
      const _exhaustive: never = clause;
      return _exhaustive;
    }
  }
}

export function ProposeAgreeWork({
  projectId,
  currentGate,
  options,
  agreement,
  include,
}: {
  projectId: string;
  currentGate: ProjectGate;
  options: OptionRow[];
  agreement: {
    parties: string | null;
    outcome: string | null;
    scope: string | null;
    money: string | null;
    time: string | null;
    changes: string | null;
    support: string | null;
    workplace: string | null;
    depositPaid: boolean;
    confirmed: boolean;
  } | null;
  include?: readonly ProjectGate[];
}) {
  const show = (gate: ProjectGate) =>
    !include || include.includes(gate);

  const agreementValues = {
    parties: agreement?.parties ?? "",
    outcome: agreement?.outcome ?? "",
    scope: agreement?.scope ?? "",
    money: agreement?.money ?? "",
    time: agreement?.time ?? "",
    changes: agreement?.changes ?? "",
    support: agreement?.support ?? "",
    workplace: agreement?.workplace ?? "",
    depositPaid: agreement?.depositPaid ?? false,
    confirmed: agreement?.confirmed ?? false,
  };

  return (
    <>
      {show("propose") ? (
        <OptionsPanel
          projectId={projectId}
          options={options}
          currentGate={currentGate}
        />
      ) : null}

      {show("agree") ? (
        <EditableCard
          title="Agree"
          hint="One page. Deposit and written confirm before you leave Agree."
          view={
            <InfoList
              items={[
                ...AGREEMENT_CLAUSES.map((item) => ({
                  label: item.clause,
                  value: agreementValues[clauseField(item.clause)],
                })),
                {
                  label: "Deposit paid",
                  value: displayYesNo(agreementValues.depositPaid),
                },
                {
                  label: "Signed or WhatsApp confirmed",
                  value: displayYesNo(agreementValues.confirmed),
                },
              ]}
            />
          }
          form={
            <AgreementForm projectId={projectId} agreement={agreementValues} />
          }
        />
      ) : null}
    </>
  );
}
