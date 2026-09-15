export async function sendPortalMagicLinkEmail(input: {
  to: string;
  name: string;
  url: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.PORTAL_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { sent: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: "Your Numan Usman portal link",
        text: `Hi ${input.name},\n\nUse this one-time link to open the client portal:\n\n${input.url}\n\nIt expires in 24 hours. If you did not ask for this, ignore the email.\n`,
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
