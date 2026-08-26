export default function AuthLoadingState({
  label = "Loading authentication",
  variant = "login",
}) {
  const isSignup = variant === "signup";
  const fieldCount = isSignup ? 4 : 2;

  return (
    <div
      aria-label={label}
      className="relative flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] px-4 py-5 sm:py-10"
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 mx-auto my-auto w-full min-w-0 max-w-sm">
        <div className="mb-4 h-4 w-20 animate-pulse rounded bg-white/[0.06] sm:mb-6" />
        <div className="mb-5 flex items-center justify-center gap-2.5 sm:mb-8">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-orange-500/20" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/[0.08]" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#162035] to-[#0F1828] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-6">
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
          <div className="h-6 w-36 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-3 h-3 w-52 animate-pulse rounded bg-white/[0.05]" />

          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:gap-4">
            {Array.from({ length: fieldCount }).map((_, index) => (
              <div key={index}>
                <div className="mb-2 h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-10 animate-pulse rounded-lg bg-[#0A1120] ring-1 ring-white/[0.06] sm:h-11" />
              </div>
            ))}
          </div>

          <div className="mt-4 h-11 animate-pulse rounded-lg bg-orange-500/25" />

          {isSignup && (
            <div className="mx-auto mt-5 h-8 w-4/5 animate-pulse rounded bg-white/[0.035]" />
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <div className="h-3 w-5 animate-pulse rounded bg-white/[0.05]" />
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="mt-5 h-11 animate-pulse rounded-lg bg-[#0A1120] ring-1 ring-white/[0.06]" />
          <div className="mx-auto mt-6 h-3 w-44 animate-pulse rounded bg-white/[0.05]" />
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </div>
  );
}
