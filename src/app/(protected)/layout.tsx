import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { MobileNav } from "@/components/MobileNav";
import { requireMember } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, role } = await requireMember();

  return (
    <div className="flex min-h-screen gap-6 px-6 pb-10 pt-6">
      <Sidebar role={role} />
      <main className="flex-1">
        <div className="surface rounded-xl px-6 py-6">
          <MobileNav role={role} />
          <Topbar userEmail={user?.email} role={role} />
          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
