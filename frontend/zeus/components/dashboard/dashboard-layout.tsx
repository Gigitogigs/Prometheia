export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      {children}
    </div>
  );
}
