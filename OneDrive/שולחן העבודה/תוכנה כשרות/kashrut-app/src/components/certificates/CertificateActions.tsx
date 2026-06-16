"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { releaseCertificate, markCertificateSent } from "@/actions/certificates";

export function CertificateActions({
  certId,
  status,
  pdfUrl,
}: {
  certId: string;
  status: string;
  pdfUrl: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRelease() {
    setLoading(true);
    await releaseCertificate(certId);
    router.refresh();
    setLoading(false);
  }

  async function handleSent(via: "email" | "whatsapp" | "manual") {
    setLoading(true);
    await markCertificateSent(certId, via);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {pdfUrl && (
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
          PDF
        </a>
      )}
      {status === "WAITING_PAYMENT" && (
        <button
          onClick={handleRelease}
          disabled={loading}
          className="text-xs rounded bg-green-600 text-white px-2 py-1 hover:bg-green-700 disabled:opacity-50"
        >
          שחרר
        </button>
      )}
      {status === "READY_TO_SEND" && (
        <div className="flex gap-1">
          <button onClick={() => handleSent("email")} disabled={loading} className="text-xs rounded bg-blue-600 text-white px-2 py-1 hover:bg-blue-700 disabled:opacity-50">
            📧
          </button>
          <button onClick={() => handleSent("whatsapp")} disabled={loading} className="text-xs rounded bg-green-600 text-white px-2 py-1 hover:bg-green-700 disabled:opacity-50">
            💬
          </button>
          <button onClick={() => handleSent("manual")} disabled={loading} className="text-xs rounded bg-gray-500 text-white px-2 py-1 hover:bg-gray-600 disabled:opacity-50">
            ידנית
          </button>
        </div>
      )}
    </div>
  );
}
