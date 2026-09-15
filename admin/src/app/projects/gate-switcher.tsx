import { ConfirmClick } from "@/components/confirm-submit";
import { cn } from "@/lib/utils";
import {
  GATE_GUIDES,
  gateGuide,
  gateMoveBlock,
  gateMoveBlockMessage,
} from "@/lib/gates";
import type { PersonRole, ProjectGate, ProjectStatus, QualifyOutcome, WorkKind } from "@/db/schema";
import { moveGateAction } from "./actions";

type GateSwitcherProps = {
  project: {
    id: string;
    currentGate: ProjectGate;
    problemSentence: string | null;
    status: ProjectStatus;
    workKind: WorkKind;
  };
  people: Array<{ role: PersonRole }>;
  hasSelectedOption: boolean;
  qualifyOutcome: QualifyOutcome | null;
  intakeProblemAnswer: string | null;
  intakeSuccessAnswer: string | null;
  depositPaid: boolean;
  agreementConfirmed: boolean;
};

export function GateSwitcher({
  project,
  people,
  hasSelectedOption,
  qualifyOutcome,
  intakeProblemAnswer,
  intakeSuccessAnswer,
  depositPaid,
  agreementConfirmed,
}: GateSwitcherProps) {
  const current = gateGuide(project.currentGate);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {GATE_GUIDES.map((item) => {
          const blocked = gateMoveBlock({
            from: project.currentGate,
            to: item.id,
            people,
            problemSentence: project.problemSentence,
            status: project.status,
            workKind: project.workKind,
            hasSelectedOption,
            qualifyOutcome,
            intakeProblemAnswer,
            intakeSuccessAnswer,
            depositPaid,
            agreementConfirmed,
          });
          const active = item.id === project.currentGate;
          if (active) {
            return (
              <span
                key={item.id}
                className="rounded-full border border-gold-500 bg-gold-500 px-3 py-1.5 text-sm text-white"
              >
                {item.label}
              </span>
            );
          }
          if (blocked) {
            return (
              <span
                key={item.id}
                title={gateMoveBlockMessage(blocked)}
                className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-500"
              >
                {item.label}
              </span>
            );
          }
          return (
            <form key={item.id} action={moveGateAction}>
              <input type="hidden" name="id" value={project.id} />
              <input type="hidden" name="gate" value={item.id} />
              <ConfirmClick
                message={`Move to ${item.label}?`}
                className={cn(
                  "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-dark-950 hover:border-gold-500",
                )}
              >
                {item.label}
              </ConfirmClick>
            </form>
          );
        })}
      </div>
      <div className="rounded-xl bg-gray-200 p-4 text-sm text-gray-700 space-y-2">
        <p>
          <span className="font-medium text-dark-950">Public: </span>
          {current.publicStep}
        </p>
        <p>
          <span className="font-medium text-dark-950">You: </span>
          {current.youDo}
        </p>
        <p>
          <span className="font-medium text-dark-950">They: </span>
          {current.theyDo}
        </p>
        <p>
          <span className="font-medium text-dark-950">Exit when: </span>
          {current.exitWhen}
        </p>
      </div>
    </div>
  );
}
