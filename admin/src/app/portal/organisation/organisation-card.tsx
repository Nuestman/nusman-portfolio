"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayText } from "@/lib/text";
import { linkClassName } from "@/lib/links";
import { PortalOrganisationForm } from "./organisation-form";

function Detail({
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
        <p className="mt-2 text-dark-950">
          <a href={href} className={linkClassName("inline")}>
            {text}
          </a>
        </p>
      ) : (
        <p className={text ? "mt-2 text-dark-950" : "mt-2 text-gray-400"}>
          {displayText(value)}
        </p>
      )}
    </div>
  );
}

export function PortalOrganisationCard({
  client,
}: {
  client: {
    name: string;
    organisation: string | null;
    email: string | null;
    phone: string | null;
  };
}) {
  const [editing, setEditing] = useState(false);
  const orgEmail = client.email?.trim() ?? "";
  const orgPhone = client.phone?.trim() ?? "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <CardTitle>Hiring party</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing((current) => !current)}
        >
          {editing ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <PortalOrganisationForm
            client={{
              name: client.name,
              organisation: client.organisation ?? "",
              email: client.email ?? "",
              phone: client.phone ?? "",
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <Detail label="Hiring party" value={client.name} />
            <Detail label="Organisation" value={client.organisation} />
            <Detail
              label="Email"
              value={client.email}
              href={orgEmail ? `mailto:${orgEmail}` : null}
            />
            <Detail
              label="Phone"
              value={client.phone}
              href={orgPhone ? `tel:${orgPhone}` : null}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
