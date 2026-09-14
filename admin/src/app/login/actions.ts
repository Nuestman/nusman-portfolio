"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  createSession,
  credentialsConfigured,
  getAdminCredentials,
  passwordsMatch,
} from "@/lib/auth";
import { safeInternalPath } from "@/lib/paths";

export type LoginState = {
  error: string | null;
};

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!credentialsConfigured()) {
    return {
      error: "Desk login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expected = getAdminCredentials();

  if (email !== expected.email || !passwordsMatch(password, expected.password)) {
    return { error: "Email or password is wrong." };
  }

  await createSession(email);
  redirect(safeInternalPath(String(formData.get("from") ?? "")));
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
