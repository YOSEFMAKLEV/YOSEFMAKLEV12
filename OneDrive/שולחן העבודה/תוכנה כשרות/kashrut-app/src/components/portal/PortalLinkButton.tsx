"use client";

import { useState } from "react";
import { generateClientPortalToken, generateSiteAccessToken } from "@/actions/portal";

type Props =
  | { type: "client"; id: string; existingToken?: string | null }
  | { type: "site"; id: string; existingToken?: string | null };

export function PortalLinkButton(props: Props) {
  const [token, setToken] = useState<string | null>(props.existingToken ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const label = props.type === "client" ? "פורטל יבואן" : "פורטל עסק";
  const portalPath = props.type === "client" ? "importer" : "business";

  async function generate() {
    setLoading(true);
    const t = props.type === "client"
      ? await generateClientPortalToken(props.id)
      : await generateSiteAccessToken(props.id);
    setToken(t);
    setLoading(false);
  }

  function getUrl(t: string) {
    return `${window.location.origin}/portal/${portalPath}/${t}`;
  }

  async function copy() {
    if (!token) return;
    await navigator.clipboard.writeText(getUrl(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!token) {
    return (
      <button onClick={generate} disabled={loading}
        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50">
        {loading ? "מייצר קישור..." : `צור קישור — ${label}`}
      </button>
    );
  }

  const url = typeof window !== "undefined" ? getUrl(token) : `/portal/${portalPath}/${token}`;

  return (
    <div className="flex items-center gap-2">
      <input readOnly value={url}
        className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 font-mono" />
      <button onClick={copy}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}>
        {copied ? "הועתק!" : "העתק"}
      </button>
      <button onClick={generate} disabled={loading}
        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
        חדש
      </button>
    </div>
  );
}
