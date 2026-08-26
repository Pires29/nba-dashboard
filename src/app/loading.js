export default function AppLoading() {
  return (
    <div
      aria-label="Loading page"
      className="min-h-screen bg-[#060E1A] px-6 py-6 text-white"
    >
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1120px] flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-orange-500/20" />
            <div className="h-4 w-24 animate-pulse rounded bg-white/[0.08]" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.08]" />
        </div>

        <main className="flex flex-1 flex-col justify-center py-14">
          <div className="max-w-xl">
            <div className="h-5 w-40 animate-pulse rounded bg-orange-500/15" />
            <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-white/[0.07]" />
            <div className="mt-3 h-10 w-4/5 animate-pulse rounded-xl bg-white/[0.05]" />
            <div className="mt-6 h-4 w-full animate-pulse rounded bg-white/[0.04]" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.03]"
              />
            ))}
          </div>
        </main>
      </div>
      <span className="sr-only" aria-live="polite">
        Loading page
      </span>
    </div>
  );
}
