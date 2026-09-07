export const APP_PHASES = {
  BETA: "beta",
  EARLY_ACCESS: "early_access",
  PUBLIC: "public",
};

const VALID_PHASES = new Set(Object.values(APP_PHASES));

function normalizePhase(value) {
  return VALID_PHASES.has(value) ? value : null;
}

export function getAppPhase() {
  return (
    normalizePhase(process.env.APP_PHASE) ||
    normalizePhase(process.env.NEXT_PUBLIC_APP_PHASE) ||
    (process.env.CLOSED_BETA === "true" ? APP_PHASES.BETA : APP_PHASES.PUBLIC)
  );
}

export function getLaunchConfig() {
  const phase = getAppPhase();
  const isBeta = phase === APP_PHASES.BETA;
  const isEarlyAccess = phase === APP_PHASES.EARLY_ACCESS;
  const isPublic = phase === APP_PHASES.PUBLIC;

  return {
    phase,
    isBeta,
    isEarlyAccess,
    isPublic,
    access: {
      requiresBetaCode: isBeta,
      showBetaAccess: isBeta,
    },
    cta: {
      primary: isBeta
        ? "Join the Closed Beta"
        : isEarlyAccess
          ? "Get Early Access"
          : "Start 7-Day Trial",
      navPrimary: isBeta
        ? "Test Beta"
        : isEarlyAccess
          ? "Early Access"
          : "Open Props",
      secondary: "View Plans",
    },
    pricing: {
      checkoutEnabled: !isBeta,
      showEarlyAccessPricing: isBeta || isEarlyAccess,
      showTrialPlan: isPublic,
      badgeText: isBeta
        ? "Closed beta"
        : isEarlyAccess
          ? "Early access"
          : null,
      headline: isBeta
        ? "Early access pricing after beta."
        : isEarlyAccess
          ? "Early access pricing."
          : "Start free. Unlock every player.",
      description: isBeta
        ? "Selected beta testers can help shape PropInsight before launch, then get access to early pricing when checkout opens."
        : isEarlyAccess
          ? "Limited Early Access pricing is available before regular public pricing begins."
          : "Free gives you full analysis for 15 featured players each day. Pro removes the player limit.",
      perkText: isBeta
        ? "Selected active beta testers can earn up to 60 days of free Pro access after the beta."
        : isEarlyAccess
          ? "Limited Early Access pricing. Regular pricing will be €7.99/month or €39.99/season."
          : "Every option includes the same complete Pro access",
      disabledCheckoutLabel: isBeta ? "Closed beta only" : null,
      footerText: isBeta
        ? "Apply to become a beta tester. Checkout opens when Early Access begins."
        : "Secure checkout via Stripe · Cancel anytime",
    },
    betaModal: {
      eyebrow: isBeta ? "Join the closed beta" : "Early access",
      title: isBeta
        ? "Help us test PropInsight before launch."
        : "PropInsight early access is opening soon.",
      description: isBeta
        ? "The landing page is public, but the live NBA research tables are currently limited to approved beta testers."
        : "Join the early access list to be notified when more seats open.",
      perkText: "",
      waitlistSuccess: "You are on the waitlist.",
    },
    betaApplication: {
      title: "Join the Closed Beta",
      description: "Help us test PropInsight before launch.",
      perkText: "Selected beta testers may be eligible to earn up to 60 days of free Pro access after the beta.",
    },
  };
}

export const launchConfig = getLaunchConfig();
