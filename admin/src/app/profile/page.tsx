import { notFound } from "next/navigation";
import { getSessionEmail, getSessionPayload } from "@/lib/auth";
import { getSessionUser, userAvatarSrc } from "@/lib/current-user";
import { listSessionsForUser, listUsers } from "@/db/queries";
import { ConfirmDelete } from "@/components/confirm-submit";
import { DeskShell } from "@/components/desk-shell";
import { EditableCard } from "@/components/editable-card";
import { InfoList } from "@/components/info-list";
import { QueryNotice } from "@/components/query-notice";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userRoleLabel } from "@/lib/labels";
import { formatStamp } from "@/lib/text";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { AddOperatorForm } from "./add-operator-form";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";
import {
  activateUserAction,
  deactivateUserAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

function profileNotice(raw: string | undefined): string | null {
  switch (raw) {
    case "password":
      return "Password updated. Other devices were signed out.";
    case "added":
      return "Operator added.";
    case "devices":
      return "Signed out of those devices.";
    case "relogin":
      return "Sign in again to manage devices.";
    case undefined:
      return null;
    default:
      return null;
  }
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const noticeRaw = Array.isArray(params.notice) ? params.notice[0] : params.notice;
  const notice = profileNotice(noticeRaw);

  const [email, user, payload] = await Promise.all([
    getSessionEmail(),
    getSessionUser(),
    getSessionPayload(),
  ]);
  if (!user) {
    notFound();
  }

  const [operators, devices] = await Promise.all([
    user.role === "owner" ? listUsers() : Promise.resolve([user]),
    listSessionsForUser(user.id),
  ]);

  return (
    <DeskShell email={email} width="3xl">
      <div>
        <h1 className="section-heading">Profile</h1>
        <p className="mt-2 text-gray-700">
          Your Desk account. Owners can add other operators.
        </p>
      </div>
      <QueryNotice message={notice} />

      <EditableCard
        title="You"
        view={
          <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <div className="mx-auto aspect-square w-full max-w-sm sm:mx-0 sm:max-w-none">
              <UserAvatar name={user.name} src={userAvatarSrc(user)} />
            </div>
            <div className="min-w-0">
              <InfoList
                items={[
                  { label: "Name", value: user.name },
                  { label: "Title", value: user.title },
                  { label: "Email", value: user.email },
                  { label: "Phone", value: user.phone },
                  { label: "Role", value: userRoleLabel(user.role) },
                ]}
              />
            </div>
          </div>
        }
        form={<ProfileForm user={user} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.length === 0 ? (
            <p className="text-sm text-gray-600">
              Sign in again to start tracking devices.
            </p>
          ) : (
            <>
              <div className={tableFrameClassName}>
                <table className={tableClassName}>
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">When</th>
                      <th className="px-4 py-3 font-medium">Device</th>
                      <th className="px-4 py-3 font-medium text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => {
                      const current = device.id === payload?.sessionId;
                      return (
                        <tr
                          key={device.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {formatStamp(device.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {current ? "This device" : device.userAgent ?? "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {current ? (
                              <span className="text-sm text-gray-500">Current</span>
                            ) : (
                              <form action={revokeSessionAction}>
                                <input type="hidden" name="id" value={device.id} />
                                <Button type="submit" variant="outline" size="sm">
                                  Sign out
                                </Button>
                              </form>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {devices.length > 1 ? (
                <form action={revokeOtherSessionsAction}>
                  <Button type="submit" variant="secondary">
                    Sign out other devices
                  </Button>
                </form>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {user.role === "owner" ? (
        <>
          <EditableCard
            title="Operators"
            hint="People who can sign in to Desk. They are not clients."
            editLabel="Add"
            always={
              operators.length === 0 ? (
                <p className="text-sm text-gray-600">No operators yet.</p>
              ) : (
                <div className={tableFrameClassName}>
                  <table className={tableClassName}>
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium text-right">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {operators.map((row) => (
                        <tr key={row.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={row.name}
                                src={userAvatarSrc(row)}
                                size={32}
                              />
                              <span className="text-gray-700">
                                {row.name}
                                {row.active ? "" : " (inactive)"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{row.email}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {userRoleLabel(row.role)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {row.id === user.id || row.role === "owner" ? (
                              <span className="text-sm text-gray-500">—</span>
                            ) : row.active ? (
                              <form action={deactivateUserAction}>
                                <input type="hidden" name="id" value={row.id} />
                                <ConfirmDelete
                                  label="Deactivate"
                                  message={`Deactivate ${row.name}? They will not be able to sign in.`}
                                />
                              </form>
                            ) : (
                              <form action={activateUserAction}>
                                <input type="hidden" name="id" value={row.id} />
                                <Button type="submit" variant="outline" size="sm">
                                  Reactivate
                                </Button>
                              </form>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            form={<AddOperatorForm />}
          />
        </>
      ) : null}
    </DeskShell>
  );
}
