import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmorceHub — Script Protection",
  description: "Protect your Lua scripts. Set a password, get a secure loadstring. Emorce.",
  icons: { icon: "/pin.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
