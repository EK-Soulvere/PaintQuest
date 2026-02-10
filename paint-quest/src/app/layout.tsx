import type { Metadata } from "next";
import { Jacquard_12_Charted } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";

const jacquard = Jacquard_12_Charted({
  weight: "400",
  style: "normal",
  variable: "--font-jacquard",
});

export const metadata: Metadata = {
  title: "PaintQuest",
  description: "Session friendly painting progress workflow tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jacquard.variable} antialiased`}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
