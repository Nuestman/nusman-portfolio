"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { MessageComposer } from "@/components/messages/message-composer";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  openPortalConversationAction,
  type FormState,
} from "@/app/messages/actions";

const initialState: FormState = { error: null };

type ProjectOption = {
  id: string;
  title: string;
  clientId: string;
};

export function NewConversationForm({
  clients,
  projects,
}: {
  clients: Array<{ id: string; name: string }>;
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [state, action, pending] = useActionState(
    openPortalConversationAction,
    initialState,
  );

  const clientProjects = useMemo(
    () => projects.filter((project) => project.clientId === clientId),
    [projects, clientId],
  );

  return (
    <form action={action} className="mx-auto w-full max-w-lg space-y-5 p-6 md:p-8">
      <div>
        <h2 className="font-heading text-3xl text-dark-950">New conversation</h2>
        <p className="mt-2 text-sm text-gray-600">
          Pick a client and project, then open the portal thread. You can send
          the first message here or after it opens.
        </p>
      </div>

      <div>
        <label htmlFor="compose-client" className={labelClassName}>
          Client
        </label>
        <select
          id="compose-client"
          name="clientId"
          required
          value={clientId}
          className={fieldClassName}
          onChange={(event) => {
            setClientId(event.target.value);
            setProjectId("");
          }}
        >
          <option value="">Pick a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="compose-project" className={labelClassName}>
          Project
        </label>
        <select
          id="compose-project"
          name="projectId"
          required
          value={projectId}
          disabled={!clientId}
          className={fieldClassName}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">
            {!clientId
              ? "Pick a client first"
              : clientProjects.length === 0
                ? "No hiring projects for this client"
                : "Pick a project"}
          </option>
          {clientProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="compose-body" className={labelClassName}>
          First message{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <MessageComposer
          id="compose-body"
          disabled={pending}
          placeholder="Say hello or leave blank to open an empty thread"
        />
      </div>

      <FormError>{state.error}</FormError>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending || !projectId}>
          {pending ? "Opening…" : "Open conversation"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => router.push("/messages")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
