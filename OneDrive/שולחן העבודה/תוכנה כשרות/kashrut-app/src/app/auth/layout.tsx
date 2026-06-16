import "../globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
