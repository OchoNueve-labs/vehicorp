"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setChecked(true);
      return;
    }
    const role = localStorage.getItem("vehicorp_role");
    if (!role) {
      router.replace("/login");
      return;
    }
    if (role === "vendedor" && pathname === "/") {
      router.replace("/inventario");
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!checked) {
    return null;
  }

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
