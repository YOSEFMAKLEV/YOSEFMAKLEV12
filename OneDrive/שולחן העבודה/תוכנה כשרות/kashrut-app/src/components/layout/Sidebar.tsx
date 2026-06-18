"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "OFFICE_STAFF" | "MASHGIACH" | "RABBI";

const navItems = [
  { key: "dashboard",     href: "/",             icon: "⊞", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "clients",       href: "/clients",       icon: "👥", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "sites",         href: "/sites",         icon: "🏭", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "products",      href: "/products",      icon: "📦", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "projects",      href: "/projects",      icon: "📋", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "mashgichim",    href: "/mashgichim",    icon: "👤", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "myAssignments", href: "/my-assignments",      icon: "📋", roles: ["MASHGIACH"] },
  { key: "myHolograms",  href: "/mashgiach/holograms", icon: "🔢", roles: ["MASHGIACH"] },
  { key: "myProfile",    href: "/mashgiach/profile",   icon: "👤", roles: ["MASHGIACH"] },
  { key: "scheduling",   href: "/scheduling",          icon: "📅", roles: ["ADMIN", "OFFICE_STAFF", "MASHGIACH"] },
  { key: "holograms",     href: "/holograms",     icon: "🔢", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "dealers",       href: "/dealers",       icon: "🤝", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "rawMaterials",  href: "/raw-materials", icon: "🧪", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "certificates",  href: "/certificates",  icon: "📜", roles: ["ADMIN", "OFFICE_STAFF", "RABBI"] },
  { key: "finance",       href: "/finance",       icon: "💰", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "alerts",        href: "/alerts",        icon: "🔔", roles: ["ADMIN", "OFFICE_STAFF"] },
  { key: "settings",      href: "/settings",      icon: "⚙️", roles: ["ADMIN"] },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = (session?.user?.role ?? "ADMIN") as Role;

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="fixed inset-y-0 start-0 z-50 w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-700">
        <span className="text-lg font-bold text-white">✡ מערכת כשרות</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {visibleItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive =
            item.href === "/"
              ? pathname === `/${locale}` || pathname === `/${locale}/`
              : pathname.startsWith(`/${locale}${item.href}`);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{t(item.key as Parameters<typeof t>[0])}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + language + logout */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* User badge */}
        {session?.user && (
          <div className="flex items-center gap-2 px-1 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {session.user.name?.charAt(0) ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[role] ?? role}</p>
            </div>
          </div>
        )}

        {/* Language toggle */}
        <div className="flex gap-2">
          <Link
            href={pathname.replace(`/${locale}`, "/he")}
            className={cn(
              "flex-1 text-center py-1 rounded text-xs font-medium",
              locale === "he" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            עברית
          </Link>
          <Link
            href={pathname.replace(`/${locale}`, "/en")}
            className={cn(
              "flex-1 text-center py-1 rounded text-xs font-medium",
              locale === "en" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            English
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <span>↩</span>
          <span>יציאה מהמערכת</span>
        </button>
      </div>
    </aside>
  );
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "מנהל מערכת",
  OFFICE_STAFF: "צוות משרד",
  MASHGIACH: "משגיח",
  RABBI: "רב / גוף מכשיר",
};
