"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmTransfer, rejectTransfer, cancelTransfer } from "@/actions/holograms";

export function ConfirmTransferButton({ transferId }: { transferId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await confirmTransfer(transferId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? "..." : "אישור קבלה"}
    </button>
  );
}

export function RejectTransferButton({ transferId }: { transferId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await rejectTransfer(transferId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-lg bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
    >
      {loading ? "..." : "דחה"}
    </button>
  );
}

export function CancelTransferButton({ transferId }: { transferId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await cancelTransfer(transferId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
    >
      {loading ? "..." : "בטל"}
    </button>
  );
}
