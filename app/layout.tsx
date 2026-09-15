import type { Metadata } from "next";
import { DraftProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draft Fortress",
  description:
    "A fortress for your fantasy football draft and roster. Snake draft simulator, need-based picks, start/sit, and waivers.",
  applicationName: "Draft Fortress",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DraftProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">{children}</main>
        </DraftProvider>
      </body>
    </html>
  );
}
