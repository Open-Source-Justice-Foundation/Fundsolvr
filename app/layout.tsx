import type { Metadata } from "next";
import { cookies } from "next/headers";

import Sidebar from "./components/Sidebar";
import Header from "./components/header/Header";
import "./globals.css";
import { Theme } from "./types";

export const metadata: Metadata = {
  title: "resolvr",
  description: "A Bitcoin-Native Dispute Resolution Service for FOSS Bounties",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = cookies().get("theme");
  return (
    <html className={theme?.value || Theme.light}>
      <head />

      <body className="h-full bg-gray-100 dark:bg-gray-900">
        <div className="min-h-screen">
          <Sidebar />
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
