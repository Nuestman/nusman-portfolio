function oneLine(value: string, max = 160): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export async function sendInboundLeadEmail(input: {
  to: string[];
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  problem: string;
  whoFor: string;
  successLooksLike: string;
  timeline: string | null;
  budget: string | null;
  projectUrl: string;
  clientUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.DESK_FROM_EMAIL?.trim() ||
    process.env.PORTAL_FROM_EMAIL?.trim();
  if (!apiKey || !from || input.to.length === 0) {
    return { sent: false };
  }

  const lines = [
    "New inbound project request from nusman.dev.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone ?? "—"}`,
    `Organisation: ${input.organisation ?? "—"}`,
    `Timeline: ${input.timeline ?? "—"}`,
    `Budget: ${input.budget ?? "—"}`,
    "",
    "Problem:",
    input.problem,
    "",
    "Who it's for:",
    input.whoFor,
    "",
    "Success looks like:",
    input.successLooksLike,
    "",
    `Open project: ${input.projectUrl}`,
    `Open client: ${input.clientUrl}`,
    "",
    "Contact them ASAP.",
  ];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        reply_to: input.email,
        subject: `Inbound lead: ${oneLine(input.name)}${input.organisation ? ` (${oneLine(input.organisation)})` : ""}`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        sent: false,
        error: body || `Resend returned ${response.status}`,
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Email failed",
    };
  }
}
