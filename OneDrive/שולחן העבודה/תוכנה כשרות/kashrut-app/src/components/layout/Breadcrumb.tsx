"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const PATH_LABELS: Record<string, string> = {
  "":               "ראשי",
  "clients":        "לקוחות",
  "sites":          "אתרים",
  "products":       "מוצרים",
  "projects":       "פרויקטים",
  "mashgichim":     "משגיחים",
  "scheduling":     "לוח שיבוץ",
  "my-assignments": "הפרויקטים שלי",
  "holograms":      "הולוגרמות",
  "certificates":   "תעודות",
  "finance":        "כספים",
  "alerts":         "התראות",
  "settings":       "הגדרות",
  "new":            "חדש",
  "edit":           "עריכה",
  "report":         "דיווח",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "he";

  // Strip locale prefix: /he/clients/123 → ["clients", "123"]
  const segments = pathname
    .replace(`/${locale}`, "")
    .split("/")
    .filter(Boolean);

  const isHome = segments.length === 0;
  if (isHome) return null;

  // Build crumb list
  const crumbs = segments.map((seg, i) => {
    const href = `/${locale}/${segments.slice(0, i + 1).join("/")}`;
    const label = PATH_LABELS[seg] ?? seg;
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  const homeHref = `/${locale}`;

  return (
    <div className="flex items-center gap-2 mb-5 text-sm">
      {/* Back arrow button */}
      <button
        onClick={() => router.back()}
        aria-label="חזרה לדף הקודם"
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-colors shadow-sm shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: isRtl ? "rotate(180deg)" : undefined }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Home link */}
      <Link
        href={homeHref}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm shrink-0"
        aria-label="דף הבית"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      {/* Divider */}
      <span className="text-gray-300 select-none">/</span>

      {/* Crumbs */}
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {crumb.isLast ? (
            <span className="font-medium text-gray-800">{crumb.label}</span>
          ) : (
            <>
              <Link
                href={crumb.href}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                {crumb.label}
              </Link>
              <span className="text-gray-300 select-none">/</span>
            </>
          )}
        </span>
      ))}
    </div>
  );
}
