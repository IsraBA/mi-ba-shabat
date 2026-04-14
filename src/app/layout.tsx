import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { MemberSelector } from "@/components/layout/MemberSelector";
import "./globals.css";

// Load Heebo font - clean Hebrew sans-serif, great for UI
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "מי בא שבת",
  description: "אפליקציה משפחתית לתיאום שבתות וחגים",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="h-full flex flex-col font-(family-name:--font-heebo) antialiased">
        <Providers>
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
          <MemberSelector />
        </Providers>
      </body>
    </html>
  );
}
