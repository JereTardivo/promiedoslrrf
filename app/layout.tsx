import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
  title: "Promiedos LRRF",
  description: "Promiedos LRRF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/lrrf-logo.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <header className="p-4">
          <Link href="/">
            <Image
              src="/lrrf-logo.png"
              alt="Promiedos LRRF"
              width={240}
              height={120}
              className="w-32 md:w-48 h-auto hover:opacity-80 transition-opacity"
            />
          </Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
