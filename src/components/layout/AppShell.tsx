import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </>
  );
}
