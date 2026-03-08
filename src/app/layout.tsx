import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeScore",
  description: "Did you live a good life today?"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}

