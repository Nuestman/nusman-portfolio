import { linkClassName } from "@/lib/links";
import { displayText } from "@/lib/text";

function Field({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string | null;
}) {
  const text = value?.trim() ?? "";
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
        {label}
      </p>
      {text && href ? (
        <p className="mt-2 text-xl">
          <a href={href} className={linkClassName("inline")}>
            {text}
          </a>
        </p>
      ) : (
        <p
          className={
            text
              ? "mt-2 text-xl text-dark-950"
              : "mt-2 text-xl text-gray-400"
          }
        >
          {displayText(value)}
        </p>
      )}
    </div>
  );
}

export function HiringPartyView({
  name,
  organisation,
  email,
  phone,
  sourceLabel,
  notes,
}: {
  name: string;
  organisation?: string | null;
  email?: string | null;
  phone?: string | null;
  sourceLabel?: string | null;
  notes?: string | null;
}) {
  const orgLine = organisation?.trim() ?? "";
  const emailLine = email?.trim() ?? "";
  const phoneLine = phone?.trim() ?? "";
  const notesLine = notes?.trim() ?? "";
  const sourceLine = sourceLabel?.trim() ?? "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
          Name
        </p>
        <p className="mt-2 font-heading text-5xl leading-none text-dark-950 sm:text-6xl">
          {name}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
            Organisation
          </p>
          <p
            className={
              orgLine
                ? "mt-2 text-2xl text-gold-600"
                : "mt-2 text-2xl text-gray-400"
            }
          >
            {displayText(organisation)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
            How they heard about us
          </p>
          {sourceLine ? (
            <p className="mt-2">
              <span className="inline-flex rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-sm font-medium text-gold-800">
                {sourceLine}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-xl text-gray-400">{displayText(null)}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          value={email}
          href={emailLine ? `mailto:${emailLine}` : null}
        />
        <Field
          label="Phone"
          value={phone}
          href={phoneLine ? `tel:${phoneLine}` : null}
        />
      </div>

      <div className="rounded-2xl border border-gold-100 bg-gold-50/60 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
          Notes
        </p>
        <p
          className={
            notesLine
              ? "mt-2 whitespace-pre-wrap text-base leading-relaxed text-dark-950"
              : "mt-2 text-base text-gray-400"
          }
        >
          {displayText(notes)}
        </p>
      </div>
    </div>
  );
}
