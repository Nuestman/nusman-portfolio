import { UserAvatar } from "@/components/user-avatar";
import { linkClassName } from "@/lib/links";
import { cn } from "@/lib/utils";

type ProfileYouLayout = "split" | "stack";

function line(value: string | null | undefined): string | null {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function ProfileYouDetails({
  name,
  title,
  role,
  email,
  phone,
  client,
  organisation,
  compact,
}: {
  name: string;
  title?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  client?: string | null;
  organisation?: string | null;
  compact: boolean;
}) {
  const titleLine = line(title);
  const roleLine = line(role);
  const emailLine = line(email);
  const phoneLine = line(phone);
  const clientLine = line(client);
  const orgLine = line(organisation);
  const subtitle = titleLine ?? roleLine;
  const showRolePill = Boolean(
    titleLine && roleLine && titleLine !== roleLine,
  );

  return (
    <div className="min-w-0">
      <p
        className={cn(
          "font-heading text-dark-950",
          compact ? "text-4xl" : "text-6xl",
        )}
      >
        {name}
      </p>
      {subtitle ? (
        <p
          className={cn(
            "mt-2 text-gold-600",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {clientLine ? (
        <p
          className={cn(
            "mt-1.5 text-gray-500",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {clientLine}
        </p>
      ) : null}
      {orgLine && orgLine !== clientLine ? (
        <p
          className={cn(
            "mt-1.5 text-gray-500",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {orgLine}
        </p>
      ) : null}
      {emailLine || phoneLine ? (
        <div
          className={cn(
            "mt-8 space-y-2",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {emailLine ? (
            <p>
              <a href={`mailto:${emailLine}`} className={linkClassName("inline")}>
                {emailLine}
              </a>
            </p>
          ) : null}
          {phoneLine ? (
            <p>
              <a href={`tel:${phoneLine}`} className={linkClassName("inline")}>
                {phoneLine}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      {showRolePill && roleLine ? (
        <p className="mt-6">
          <span className="rounded-full bg-gold-100 px-3 py-1 text-sm font-medium text-gold-800">
            {roleLine}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function ProfileYouView({
  name,
  src,
  title,
  role,
  email,
  phone,
  client,
  organisation,
  layout = "split",
}: {
  name: string;
  src: string | null;
  title?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  client?: string | null;
  organisation?: string | null;
  layout?: ProfileYouLayout;
}) {
  const avatar = (
    <div
      className={cn(
        "aspect-square w-full",
        layout === "split" ? "mx-auto max-w-sm md:mx-0 md:max-w-none" : null,
      )}
    >
      <UserAvatar name={name} src={src} />
    </div>
  );
  const details = (
    <ProfileYouDetails
      name={name}
      title={title}
      role={role}
      email={email}
      phone={phone}
      client={client}
      organisation={organisation}
      compact={layout === "stack"}
    />
  );

  switch (layout) {
    case "stack":
      return (
        <div className="space-y-6">
          {avatar}
          {details}
        </div>
      );
    case "split":
      return (
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          {avatar}
          {details}
        </div>
      );
    default: {
      const exhaustive: never = layout;
      return exhaustive;
    }
  }
}
