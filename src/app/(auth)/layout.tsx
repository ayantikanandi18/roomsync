export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
            R
          </span>
          <span className="font-semibold text-xl">Roomsync</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
