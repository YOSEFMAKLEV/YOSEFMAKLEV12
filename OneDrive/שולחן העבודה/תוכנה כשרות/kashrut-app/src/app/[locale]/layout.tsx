import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import "../globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "מערכת ניהול כשרות",
  description: "Kashrut Agency Management System",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={geist.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 ps-64">
                <div className="p-6">{children}</div>
              </main>
            </div>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
