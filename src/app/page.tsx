import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold">
            R
          </span>
          Roomsync
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto w-full px-6 grid md:grid-cols-2 gap-12 items-center py-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Find a roommate who actually fits your life.
            </h1>
            <p className="text-lg text-muted mb-8">
              Not just a filter list — a real compatibility score based on budget, schedule, cleanliness,
              and the dealbreakers that actually end roommate situations.
            </p>
            <Link
              href="/signup"
              className="inline-flex bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Create your profile
            </Link>
          </div>

          <div className="bg-card border border-border rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                  JS
                </div>
                <div>
                  <div className="font-semibold">Jordan S.</div>
                  <div className="text-sm text-muted">Austin, TX</div>
                </div>
              </div>
              <span className="bg-accent/15 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                87% match
              </span>
            </div>
            <p className="text-sm text-foreground/80 mb-4">
              Quiet during the week, loves hosting on weekends. Clean freak, has a cat.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-black/[0.03] rounded-lg px-2 py-2 text-center">
                <div className="text-muted">Budget</div>
                <div className="font-medium">$1.1–1.4k</div>
              </div>
              <div className="bg-black/[0.03] rounded-lg px-2 py-2 text-center">
                <div className="text-muted">Clean</div>
                <div className="font-medium">5/5</div>
              </div>
              <div className="bg-black/[0.03] rounded-lg px-2 py-2 text-center">
                <div className="text-muted">Pets</div>
                <div className="font-medium">OK</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
