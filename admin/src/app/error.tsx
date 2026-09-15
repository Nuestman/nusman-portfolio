"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Desk page error", error);
  }, [error]);

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="font-heading text-2xl text-dark-950">Desk hit a snag</h1>
        <p className="text-sm text-gray-600">
          Try again. If it keeps happening, check the environment and that
          migrations are applied.
        </p>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
