import Link from "next/link";
import { NewClientForm } from "@/components/clients/NewClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/clients" className="hover:text-gray-700">לקוחות</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">לקוח חדש</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הוספת לקוח חדש</h1>
      <NewClientForm />
    </div>
  );
}
