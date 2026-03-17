import type { Metadata } from "next";
import "./globals.css";
import { AuthListener } from "./auth-listener";

export const metadata: Metadata = {
  title: "RevEng – Stripe Revenue Recovery",
  description: "Stripe webhook audit and recovery dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <AuthListener>{children}</AuthListener>
      </body>
    </html>
  );
}
