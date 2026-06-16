"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEV_USERS = [
  {
    role: "ADMIN",
    label: "מנהל מערכת",
    icon: "🛡️",
    desc: "גישה מלאה לכל מודולי המערכת",
    email: "admin@kashrut.com",
    redirect: "/",
  },
  {
    role: "OFFICE_STAFF",
    label: "צוות משרד",
    icon: "🗂️",
    desc: "לקוחות, שיבוצים, תעודות לפי הרשאה",
    email: "office@kashrut.com",
    redirect: "/",
  },
  {
    role: "MASHGIACH",
    label: "משגיח",
    icon: "✅",
    desc: "לוח שיבוצים אישי ודיווח ביקורים",
    email: "mashgiach@kashrut.com",
    redirect: "/scheduling",
  },
  {
    role: "RABBI",
    label: "רב / גוף מכשיר",
    icon: "📜",
    desc: "אישור דוחות וצפייה בתעודות",
    email: "rabbi@kashrut.com",
    redirect: "/certificates",
  },
];

const isDev = process.env.NODE_ENV === "development";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function doSignIn(emailVal: string, passwordVal: string, redirect: string) {
    setError("");
    const res = await signIn("credentials", {
      email: emailVal,
      password: passwordVal,
      redirect: false,
    });
    if (res?.error) {
      setError("אימייל או קוד שגויים.");
      setLoading(null);
      return;
    }
    router.replace(redirect);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading("form");
    await doSignIn(email, password, "/");
  }

  async function handleDevLogin(user: typeof DEV_USERS[number]) {
    setLoading(user.role);
    await doSignIn(user.email, "dev123", user.redirect);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-3xl mb-4 shadow-lg">
            ✡
          </div>
          <h1 className="text-2xl font-bold text-gray-900">מערכת ניהול כשרות</h1>
          <p className="text-gray-500 text-sm mt-1">כניסה למערכת</p>
        </div>

        {/* Dev quick-login */}
        {isDev && (
          <div className="mb-5">
            <p className="text-center text-xs font-medium text-amber-600 mb-3 flex items-center justify-center gap-1">
              <span>⚡</span> כניסה מהירה — סביבת פיתוח
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEV_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => handleDevLogin(u)}
                  disabled={loading !== null}
                  className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md p-3 text-right transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{u.icon}</span>
                    <span className="text-xs font-bold text-gray-800 group-hover:text-blue-700">
                      {loading === u.role ? "מתחבר..." : u.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-tight">{u.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {isDev && (
            <p className="text-center text-xs text-gray-400 mb-4">או כניסה עם אימייל וקוד</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                כתובת אימייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                dir="ltr"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                סיסמה / קוד
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                dir="ltr"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading !== null}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {loading === "form" ? "מתחבר..." : "כניסה למערכת"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          גישה לפורטלים חיצוניים (יבואנים / עסקים) — דרך קישור אישי בלבד
        </p>
      </div>
    </div>
  );
}
