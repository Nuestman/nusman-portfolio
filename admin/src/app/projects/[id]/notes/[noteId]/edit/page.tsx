import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getNote, getProject } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { NoteForm } from "@/app/projects/note-form";

export const dynamic = "force-dynamic";

type EditNotePageProps = {
  params: Promise<{ id: string; noteId: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id, noteId } = await params;
  if (!isUuid(id) || !isUuid(noteId)) {
    notFound();
  }

  const [project, note] = await Promise.all([getProject(id), getNote(noteId)]);
  if (!project || !note || note.projectId !== id) {
    notFound();
  }

  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
      <div>
        <Link href={`/projects/${id}`} className={linkClassName("back")}>
          ← {project.title}
        </Link>
        <h1 className="mt-3 section-heading">Edit note</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Note</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteForm
            projectId={id}
            note={{
              id: note.id,
              body: note.body,
              clientVisible: note.clientVisible,
            }}
            submitLabel="Save note"
          />
        </CardContent>
      </Card>
    </DeskShell>
  );
}
