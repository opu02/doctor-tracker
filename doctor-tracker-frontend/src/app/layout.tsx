import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Doctor Tracker", template: "%s | Doctor Tracker" },
  description: "Admin portal to manage doctors, their patients and clinic analytics.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0d9488" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
