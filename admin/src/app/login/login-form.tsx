"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-5">
      {from ? <input type="hidden" name="from" value={from} /> : null}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-dark-950">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 placeholder:text-gray-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-dark-950">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 placeholder:text-gray-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
