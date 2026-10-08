import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Pages only set their own name ("Users"); the template adds the app name.
  title: {
    template: `%s · ${APP_NAME}`,
    default: APP_NAME,
  },
  description: "Analytics and user management for a SaaS product",
  // An internal admin panel should never appear in search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        {/* Rendered once for the whole app; toast() can be called from any Client Component. */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
