export function DashboardLoading() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="grid gap-3 border-b border-neutral-200 pb-6">
          <div className="h-3 w-16 rounded bg-neutral-100" />
          <div className="h-10 max-w-xl rounded bg-neutral-100" />
          <div className="h-5 max-w-2xl rounded bg-neutral-100" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="rounded-lg border border-neutral-200 p-4" key={item}>
              <div className="h-4 w-20 rounded bg-neutral-100" />
              <div className="mt-3 h-8 w-14 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="h-[520px] rounded-lg border border-neutral-200 bg-neutral-50" />
          <div className="h-[520px] rounded-lg border border-neutral-200 bg-neutral-50" />
        </div>
      </div>
    </main>
  );
}
