import Link from "next/link";
import { NewMashgiachForm } from "@/components/mashgichim/NewMashgiachForm";

export default function NewMashgiachPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/mashgichim" className="hover:text-gray-700">משגיחים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">משגיח חדש</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הוספת משגיח חדש</h1>
      <NewMashgiachForm />
    </div>
  );
}
