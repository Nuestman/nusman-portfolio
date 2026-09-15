import { Card, CardContent } from "@/components/ui/card";

export function DatabaseNotice({
  kind,
  noun = "the database",
}: {
  kind: "missing" | "error";
  noun?: string;
}) {
  if (kind === "missing") {
    return (
      <Card>
        <CardContent className="pt-6 text-gray-700">
          <p>Neon is not linked in this environment yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            Set DATABASE_URL, then apply migrations from admin/.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 text-gray-700">
        <p>Could not read {noun}.</p>
        <p className="mt-2 text-sm text-gray-500">
          Check DATABASE_URL and that migrations have been applied.
        </p>
      </CardContent>
    </Card>
  );
}
