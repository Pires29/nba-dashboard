export async function sendPasswordResetEmail({ to, resetUrl }) {
  if (process.env.EMAIL_PROVIDER) {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("Password reset email prepared", {
      to,
      resetUrl,
      expiresInMinutes: 30,
    });
    return;
  }

  throw new Error("Password reset email provider is not configured");
}

export async function sendEmailVerificationEmail({ to, verificationUrl }) {
  if (process.env.EMAIL_PROVIDER) {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("Email verification prepared", {
      to,
      verificationUrl,
      expiresInHours: 24,
    });
    return;
  }

  throw new Error("Email verification provider is not configured");
}
