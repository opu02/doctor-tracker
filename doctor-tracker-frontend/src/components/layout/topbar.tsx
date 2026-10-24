"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import type { User } from "@/lib/types";
import { initials } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav";

export function Topbar({ user, onMenu }: { user: User; onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const title = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? "Doctor Tracker";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-slate-900">{user.name}</p>
          <p className="text-xs leading-tight text-slate-500">{user.email}</p>
        </div>
        <span
          className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
          aria-hidden
        >
          {initials(user.name)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          loading={logout.isPending}
          onClick={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}
        >
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
