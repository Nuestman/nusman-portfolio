"use client";

import { Fragment, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completePortalOnboardingAction } from "./actions";

type WelcomeStep = {
  id: "welcome" | "projects" | "messages" | "you";
  title: string;
  body: string;
  cue: string;
};

const STEPS: WelcomeStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Portal. We are grateful to have you on board.",
    body: "This is your quiet workspace with Usman — progress, brief, and messages.",
    cue: "Portal",
  },
  {
    id: "projects",
    title: "Projects & progress",
    body: "Open a project to see where the job stands and read the brief.",
    cue: "Projects",
  },
  {
    id: "messages",
    title: "Messages",
    body: "Each project has its own thread. Write in plain or rich text and attach PNG, JPEG, WebP, or PDF files when you need to.",
    cue: "Messages",
  },
  {
    id: "you",
    title: "You",
    body: "Profile holds your details and photo. Notifications and the Schedule hub keep you in the loop without digging through email.",
    cue: "You",
  },
];

function WelcomeBody({
  step,
  personName,
  accountLabel,
}: {
  step: WelcomeStep;
  personName: string;
  accountLabel: string;
}) {
  switch (step.id) {
    case "welcome": {
      return (
        <>
          Hello, {personName}. This portal is for {accountLabel} — a quiet place
          to follow your projects and talk with Usman.
        </>
      );
    }
    case "projects":
    case "messages":
    case "you":
      return <>{step.body}</>;
    default: {
      const exhaustive: never = step.id;
      return exhaustive;
    }
  }
}

function PendingLabel({
  idle,
  busy,
}: {
  idle: string;
  busy: string;
}) {
  const { pending } = useFormStatus();
  return <>{pending ? busy : idle}</>;
}

export function WelcomeWizard({
  personName,
  accountLabel,
  nextPath,
}: {
  personName: string;
  accountLabel: string;
  nextPath: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex]!;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 flex items-center gap-2" aria-label="Tour progress">
        {STEPS.map((item, index) => {
          const active = index === stepIndex;
          const done = index < stepIndex;
          return (
            <Fragment key={item.id}>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-gold-500 text-white"
                    : done
                      ? "bg-dark-950 text-white"
                      : "bg-gray-200 text-gray-500",
                )}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1} of ${STEPS.length}: ${item.title}`}
              >
                {index + 1}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "h-px min-w-2 flex-1",
                    done ? "bg-dark-950" : "bg-gray-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>

      <div
        key={step.id}
        className="portal-rise rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-sm sm:p-8"
        aria-live="polite"
      >
        <p className="font-heading text-2xl text-gold-500">{step.cue}</p>
        <h1 className="mt-2 font-heading text-4xl leading-tight text-dark-950 sm:text-5xl">
          {step.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-700">
          <WelcomeBody
            step={step}
            personName={personName}
            accountLabel={accountLabel}
          />
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <form action={completePortalOnboardingAction}>
          <input type="hidden" name="next" value={nextPath} />
          <button
            type="submit"
            className={cn(buttonClassName("link", "sm"), "text-gray-500")}
          >
            <PendingLabel idle="Skip tour" busy="Opening…" />
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {stepIndex > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              Back
            </Button>
          ) : null}
          {isLast ? (
            <form action={completePortalOnboardingAction}>
              <input type="hidden" name="next" value={nextPath} />
              <Button type="submit">
                <PendingLabel idle="Get started" busy="Opening…" />
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              onClick={() => setStepIndex((current) => current + 1)}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
