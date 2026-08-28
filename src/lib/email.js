const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_EMAIL_FROM = "PropInsight <noreply@propinsight.app>";

function getEmailProvider() {
  return (process.env.EMAIL_PROVIDER || "").trim().toLowerCase();
}

function getEmailFrom() {
  return process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;
}

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return apiKey;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendResendEmail({ to, subject, text, html, fetchImpl }) {
  const apiKey = getResendApiKey();
  const emailFetch = fetchImpl || globalThis.fetch;
  if (!emailFetch) throw new Error("Fetch API is not available");

  const response = await emailFetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    let details = "";
    try {
      const body = await response.json();
      details = body?.message ? `: ${body.message}` : "";
    } catch {
      details = "";
    }
    throw new Error(`Resend email failed with status ${response.status}${details}`);
  }
}

async function sendEmail(message) {
  const provider = getEmailProvider();

  if (provider === "resend") {
    await sendResendEmail(message);
    return;
  }

  if (!provider && process.env.NODE_ENV !== "production") {
    console.info(`${message.subject} email prepared`, {
      to: message.to,
      text: message.text,
    });
    return;
  }

  if (provider) {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
  }

  throw new Error("Email provider is not configured");
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  await sendEmail({
    to,
    subject: "Reset your PropInsight password",
    text: [
      "Reset your PropInsight password",
      "",
      "Use this link to choose a new password:",
      resetUrl,
      "",
      "This link expires in 30 minutes. If you did not request it, you can ignore this email.",
    ].join("\n"),
    html: `
      <h1>Reset your PropInsight password</h1>
      <p>Use this link to choose a new password:</p>
      <p><a href="${escapeHtml(resetUrl)}">Reset password</a></p>
      <p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>
    `,
  });
}

export async function sendEmailVerificationEmail({ to, verificationUrl }) {
  await sendEmail({
    to,
    subject: "Verify your PropInsight email",
    text: [
      "Verify your PropInsight email",
      "",
      "Use this link to verify your email address:",
      verificationUrl,
      "",
      "This link expires in 24 hours. If you did not create a PropInsight account, you can ignore this email.",
    ].join("\n"),
    html: `
      <h1>Verify your PropInsight email</h1>
      <p>Use this link to verify your email address:</p>
      <p><a href="${escapeHtml(verificationUrl)}">Verify email</a></p>
      <p>This link expires in 24 hours. If you did not create a PropInsight account, you can ignore this email.</p>
    `,
  });
}
