import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { MemberSelector } from "@/components/layout/MemberSelector";
import { NotificationBanner } from "@/components/layout/NotificationBanner";
import "./globals.css";

// Load Heebo font - clean Hebrew sans-serif, great for UI
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "מי בא שבת",
  description: "האפליקציה המדוברת כבר שנים סוף סוף כאן. כולל חלוקת משימות וחדרים 💪",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "מי בא שבת",
    description: "האפליקציה המדוברת כבר שנים סוף סוף כאן. כולל חלוקת משימות וחדרים 💪",
    images: [{ url: "/icons/og-image.png", width: 1200, height: 630 }],
    locale: "he_IL",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
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
  // Inline script applies the saved theme before paint to prevent flash
  const themeScript = `
    try {
      var m = localStorage.getItem('theme_mode') || 'system';
      var d = m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (d) document.documentElement.classList.add('dark');
    } catch (e) {}
  `;

  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full flex flex-col font-(family-name:--font-heebo) antialiased">
        <Providers>
          <Header />
          <NotificationBanner />
          <main className="flex-1 overflow-auto">{children}</main>
          <MemberSelector />
        </Providers>
      </body>
    </html>
  );
}
