import React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";

const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "DankDrafts - Create Memes from Templates",
  description:
    "Create hilarious memes from popular templates. Drag text anywhere, customize, and download your creations as JPG.",
};

export const viewport: Viewport = {
  themeColor: "#f9f6f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${_dmSans.variable} ${_spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
