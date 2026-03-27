import { resend } from "../../../lib/resend";

export async function POST() {
  const from = process.env.AUTH_FROM || "devchat@example.com";
  const to = process.env.TEST_EMAIL_TO || "you@example.com";

  const result = await resend.emails.send({
    from,
    to,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });

  return Response.json({ ok: true, result });
}
