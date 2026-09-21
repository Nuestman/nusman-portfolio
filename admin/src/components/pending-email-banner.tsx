import { buttonClassName } from "@/components/ui/button";
import {
  confirmInboundEmailAction,
  resendInboundEmailAction,
} from "@/app/projects/actions";

export function inboundEmailNotice(raw: string | undefined): string | null {
  switch (raw) {
    case "inbound-confirmed":
      return "Email confirmed. This project is active.";
    case "inbound-already":
      return "This email was already confirmed.";
    case "inbound-resent":
      return "Confirmation email sent again.";
    case "inbound-resend-missing":
      return "No pending confirmation to resend.";
    case "inbound-resend-failed":
      return "Could not send the confirmation email. Try again shortly.";
    case "inbound-confirm-failed":
      return "Could not confirm this email.";
    default:
      return null;
  }
}

function uniquePending(
  rows: Array<{ projectId: string; projectTitle: string }>,
) {
  const seen = new Set<string>();
  const unique: Array<{ projectId: string; projectTitle: string }> = [];
  for (const row of rows) {
    if (seen.has(row.projectId)) {
      continue;
    }
    seen.add(row.projectId);
    unique.push(row);
  }
  return unique;
}

export function PendingEmailBanner({
  projectId,
  projectTitle,
  next,
}: {
  projectId: string;
  projectTitle?: string;
  next: string;
}) {
  return (
    <div className="rounded-xl border border-gold-500/35 bg-gold-500/10 px-4 py-4">
      <p className="font-medium text-dark-950">Pending email confirmation</p>
      <p className="mt-1 text-sm text-gray-700">
        {projectTitle ? (
          <>
            <span className="font-medium">{projectTitle}</span> is on Desk as
            inactive until the visitor confirms their email.
          </>
        ) : (
          "This inbound request is on Desk as inactive until the visitor confirms their email."
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={confirmInboundEmailAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className={buttonClassName("default", "sm")}>
            Confirm email
          </button>
        </form>
        <form action={resendInboundEmailAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className={buttonClassName("outline", "sm")}>
            Resend confirmation
          </button>
        </form>
      </div>
    </div>
  );
}

export function PendingEmailBanners({
  rows,
  next,
}: {
  rows: Array<{ projectId: string; projectTitle: string }>;
  next: string;
}) {
  const pending = uniquePending(rows);
  if (pending.length === 0) {
    return null;
  }
  return (
    <div className="space-y-3">
      {pending.map((row) => (
        <PendingEmailBanner
          key={row.projectId}
          projectId={row.projectId}
          projectTitle={row.projectTitle}
          next={next}
        />
      ))}
    </div>
  );
}
