"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { linkClassName } from "@/lib/links";
import { cn } from "@/lib/utils";
import {
  createDeskNotificationAction,
  type FormState,
} from "@/app/notifications/actions";

const initialState: FormState = { error: null };

const tightFieldClassName = cn(fieldClassName, "px-3 py-2 text-sm");
const tightLabelClassName = cn(labelClassName, "mb-1");

type PersonOption = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
};

type ClientOption = {
  id: string;
  name: string;
};

type Target = "desk" | "person" | "client";

export function DeskNotificationForm({
  people,
  clients,
}: {
  people: PersonOption[];
  clients: ClientOption[];
}) {
  const [state, action, pending] = useActionState(
    createDeskNotificationAction,
    initialState,
  );
  const [target, setTarget] = useState<Target>("desk");

  return (
    <form action={action} className="mx-auto max-w-xl space-y-3">
      {state.error ? (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="target" className={tightLabelClassName}>
          Send to
        </label>
        <select
          id="target"
          name="target"
          required
          value={target}
          onChange={(event) => setTarget(event.target.value as Target)}
          className={tightFieldClassName}
        >
          <option value="desk">All Desk operators</option>
          <option value="person">One portal person</option>
          <option value="client">All portal people on a client</option>
        </select>
      </div>

      {target === "person" ? (
        <div>
          <label htmlFor="personId" className={tightLabelClassName}>
            Portal person
          </label>
          <select
            id="personId"
            name="personId"
            required
            className={tightFieldClassName}
          >
            <option value="">Choose a person…</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.clientName}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {target === "client" ? (
        <div>
          <label htmlFor="clientId" className={tightLabelClassName}>
            Client
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            className={tightFieldClassName}
          >
            <option value="">Choose a client…</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className={tightLabelClassName}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          className={tightFieldClassName}
        />
      </div>

      <div>
        <label htmlFor="body" className={tightLabelClassName}>
          Body
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          maxLength={4000}
          className={tightFieldClassName}
        />
      </div>

      <div>
        <label htmlFor="href" className={tightLabelClassName}>
          Link (optional)
        </label>
        <input
          id="href"
          name="href"
          placeholder="/projects/…"
          className={tightFieldClassName}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send notice"}
        </Button>
        <Link href="/notifications" className={linkClassName("back")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
