"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRawMaterial } from "@/actions/products";

const KOSHER_TYPES = [
  { value: "PAREVE", label: "פרווה" },
  { value: "DAIRY",  label: "חלבי" },
  { value: "MEAT",   label: "בשרי" },
];

export function NewRawMaterialForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    if (!name) { setError("שם חומר הגלם הוא שדה חובה"); return; }

    startTransition(async () => {
      try {
        await createRawMaterial({
          productId,
          name,
          supplier: (fd.get("supplier") as string).trim() || undefined,
          country: (fd.get("country") as string).trim() || undefined,
          kosherType: (fd.get("kosherType") as string) || undefined,
          certificateIssuedBy: (fd.get("certificateIssuedBy") as string).trim() || undefined,
          notes: (fd.get("notes") as string).trim() || undefined,
        });
        router.push(`/products/${productId}`);
        router.refresh();
      } catch {
        setError("שגיאה בשמירה — נסה שוב");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          שם חומר הגלם <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          required
          placeholder="לדוגמה: קקאו גולמי, אבקת חלב..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Supplier + Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ספק</label>
          <input
            name="supplier"
            placeholder="שם הספק"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ארץ מקור</label>
          <input
            name="country"
            placeholder="לדוגמה: US, FR, NZ..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Kosher Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">סיווג כשרות</label>
        <div className="flex gap-2">
          {KOSHER_TYPES.map(({ value, label }) => (
            <label key={value} className="flex-1 cursor-pointer">
              <input type="radio" name="kosherType" value={value} defaultChecked={value === "PAREVE"} className="sr-only peer" />
              <div className={`text-center py-2 rounded-lg border-2 text-sm font-medium transition-colors
                peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700
                border-gray-200 text-gray-400 hover:border-gray-300`}>
                {label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Certificate Issued By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">גוף שהנפיק תעודה (אם קיים)</label>
        <input
          name="certificateIssuedBy"
          placeholder="לדוגמה: OU, KOF-K, בד&quot;ץ..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="הערות נוספות (רשות)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Context reminder */}
      <div className="rounded-lg bg-gray-50 border px-4 py-3 text-sm text-gray-500">
        מוצר: <span className="font-medium text-gray-800">{productName}</span>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "שומר..." : "הוסף חומר גלם"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
