"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
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

type MobileNavProps = {
  role: UserRole;
};

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const navItems = useMemo(() => navByRole[role] ?? navByRole.Unknown, [role]);

  return (
    <div className="surface mb-6 flex flex-wrap items-center gap-3 rounded-xl p-4 xl:hidden">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white">
          <span className="text-xs font-semibold">BP</span>
        </div>
        <p className="text-sm font-semibold text-foreground">Bac PowerSchool</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold",
                active
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
