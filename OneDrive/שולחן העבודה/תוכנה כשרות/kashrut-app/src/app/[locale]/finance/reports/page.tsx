import Link from "next/link";
import { MonthlyReportClient } from "@/components/finance/MonthlyReportClient";

export default function ReportsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/finance" className="hover:text-gray-700">כספים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">דוחות</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">דוחות</h1>
      <MonthlyReportClient />
    </div>
  );
}
