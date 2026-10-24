"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ErrorState, FullPageLoader } from "@/components/ui/states";
import { useMe } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: user, isPending, isError, error, refetch } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // close the mobile drawer after navigating
  useEffect(() => setMenuOpen(false), [pathname]);

  if (isPending) return <FullPageLoader label="Loading your workspace…" />;

  if (isError) {
    // 401 -> api() is already redirecting to /login
    if (error instanceof ApiError && error.status === 401) return <FullPageLoader label="Redirecting to login…" />;
    return (
      <div className="grid min-h-screen place-items-center">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Topbar user={user} onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
