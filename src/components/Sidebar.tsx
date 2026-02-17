"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/auth";

type NavItem = { href: string; label: string };

const navByRole: Record<UserRole, NavItem[]> = {
  Admin: [
    { href: "/", label: "Dashboard" },
    { href: "/students", label: "Students" },
    { href: "/reports", label: "Reports" },
  ],
  Teacher: [
    { href: "/", label: "Dashboard" },
    { href: "/students", label: "Students" },
    { href: "/reports", label: "Reports" },
  ],
  Student: [
    { href: "/", label: "Dashboard" },
    { href: "/reports", label: "Reports" },
  ],
  Unknown: [{ href: "/", label: "Dashboard" }],
};

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = useMemo(() => navByRole[role] ?? navByRole.Unknown, [role]);

  useEffect(() => {
    const stored = window.localStorage.getItem("bps-sidebar");
    if (stored) setCollapsed(stored === "collapsed");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("bps-sidebar", collapsed ? "collapsed" : "open");
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "surface sticky top-6 hidden h-[calc(100vh-3rem)] flex-col rounded-xl px-5 py-6 xl:flex",
        collapsed ? "w-[90px]" : "w-[270px]"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
            <span className="text-lg font-semibold">BP</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Bac
              </p>
              <p className="text-lg font-semibold text-foreground">
                PowerSchool
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary-500 hover:text-primary-600"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                  : "text-slate-600 hover:bg-primary-50 hover:text-primary-600"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500",
          collapsed && "hidden"
        )}
      >
        Keep attendance and fee records updated to unlock real-time insights.
      </div>
    </aside>
  );
}
