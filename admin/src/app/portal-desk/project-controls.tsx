"use client";

import Link from "next/link";
import { setPortalIntakeOpenAction } from "@/app/portal-desk/actions";
import { Button, buttonClassName } from "@/components/ui/button";

export function PortalProjectControls({
  projectId,
  portalIntakeOpen,
  messageCount,
  scheduleRequestCount = 0,
}: {
  projectId: string;
  portalIntakeOpen: boolean;
  messageCount: number;
  scheduleRequestCount?: number;
}) {
  return (
    <div className="space-y-8">
      <form action={setPortalIntakeOpenAction} className="space-y-4">
        <input type="hidden" name="projectId" value={projectId} />
        <label className="flex items-center gap-2 text-sm text-dark-950">
          <input
            type="checkbox"
            name="portalIntakeOpen"
            defaultChecked={portalIntakeOpen}
            className="h-4 w-4 rounded border-gray-200 text-gold-500 focus:ring-gold-500"
          />
          Clients can edit the project brief
        </label>
        <Button type="submit" variant="secondary" size="sm">
          Save brief access
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-heading text-xl text-dark-950">Messages</h3>
        <p className="text-sm text-gray-600">
          {messageCount === 0
            ? "No portal messages yet."
            : `${messageCount} message${messageCount === 1 ? "" : "s"} in this thread.`}
        </p>
        <Link
          href={`/messages/${projectId}`}
          className={buttonClassName("default", "sm")}
        >
          Open conversation
        </Link>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-xl text-dark-950">Schedule</h3>
        <p className="text-sm text-gray-600">
          {scheduleRequestCount === 0
            ? "No client meeting requests waiting."
            : `${scheduleRequestCount} client request${scheduleRequestCount === 1 ? "" : "s"} waiting — open Schedule above and Propose time.`}
        </p>
      </div>
    </div>
  );
}
