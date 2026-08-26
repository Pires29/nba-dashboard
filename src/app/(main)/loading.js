export default function HomeLoading() {
  return (
    <div
      aria-label="Loading homepage"
      className="relative min-h-full overflow-hidden bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] px-6 py-16"
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1120px]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-orange-500/15" />
          <div className="mt-7 h-12 w-full max-w-2xl animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="mt-3 h-12 w-4/5 animate-pulse rounded-xl bg-white/[0.05]" />
          <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.04]" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
          <div className="mt-9 flex w-full max-w-md gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-orange-500/20" />
            <div className="h-12 flex-1 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="min-h-52 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
            >
              <div className="h-4 w-20 rounded bg-white/[0.06]" />
              <div className="mt-6 h-10 w-28 rounded bg-white/[0.05]" />
              <div className="mt-5 h-3 w-full rounded bg-white/[0.04]" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.04]" />
              <div className="mt-8 h-11 rounded-xl bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        Loading homepage
      </span>
    </div>
  );
}
