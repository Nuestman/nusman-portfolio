"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { personRoleLabel } from "@/lib/labels";
import { displayText } from "@/lib/text";
import { tableClassName, TableFrame } from "@/lib/tables";
import type { PersonRole } from "@/db/schema";
import { PortalRequestPersonForm } from "./request-person-form";

type OrgPerson = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: PersonRole;
  portalEnabled: boolean;
  portalRequestedAt: Date | string | null;
  emailVerifiedAt: Date | string | null;
};

function statusLabel(person: OrgPerson): string {
  if (person.portalEnabled) {
    return "Portal on";
  }
  if (person.portalRequestedAt) {
    return "Awaiting Usman";
  }
  if (person.email && !person.emailVerifiedAt) {
    return "Email unconfirmed";
  }
  return "No Portal yet";
}

export function PortalPeopleCard({ people }: { people: OrgPerson[] }) {
  const [requesting, setRequesting] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <CardTitle>People</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRequesting((current) => !current)}
        >
          {requesting ? "Cancel" : "Request person"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {requesting ? (
          <PortalRequestPersonForm onCancel={() => setRequesting(false)} />
        ) : null}

        {people.length === 0 ? (
          <p className="text-sm text-gray-600">
            No people on this organisation yet.
          </p>
        ) : (
          <TableFrame>
            <table className={tableClassName}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                </tr>
              </thead>
              <tbody>
                {people.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-dark-950">{row.name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {personRoleLabel(row.role)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {displayText(row.email)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {statusLabel(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        )}
      </CardContent>
    </Card>
  );
}
