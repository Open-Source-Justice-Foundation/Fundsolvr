import type { Metadata } from "next";

import Sidebar from "./components/Sidebar";
import Header from "./components/header/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "resolvr",
  description: "A Bitcoin-Native Dispute Resolution Service for FOSS Bounties",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark h-full bg-gray-900">
      <head />
      <body className="min-h-screen">
        <Sidebar />
        <Header />
        {children}
      </body>
    </html>
  );
}
