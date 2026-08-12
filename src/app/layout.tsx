import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RoveClip | Ubah Views Menjadi Penghasilan",
  description: "Platform distribusi video pendek berbasis AI untuk brand dan clipper profesional. Hasilkan uang dari TikTok, YouTube Shorts, dan Reels dengan views terverifikasi.",
  keywords: ["RoveClip", "Clipper", "Video Pendek", "TikTok Affiliate", "Make Money Online", "Brand Campaign", "AI Views Verification"],
  openGraph: {
    title: "RoveClip | Ubah Views Menjadi Penghasilan",
    description: "Platform distribusi video pendek berbasis performa (CPM).",
    url: "https://roveclip.com",
    siteName: "RoveClip",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoveClip | Platform Distribusi Video Pendek",
    description: "Hasilkan uang dari views TikTok dan Reels. 100% Anti-Fraud AI.",
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  let walletBalance = 0;
  if (user?.id) {
    const q = await prisma.user.findUnique({
      where: { id: user.id },
      select: { wallet_balance: true }
    });
    walletBalance = Number(q?.wallet_balance || 0);
  }

  const dashboardUrl =
    user?.role === 'ADMIN'   ? '/admin/dashboard' :
    user?.role === 'BRAND'   ? '/brand/dashboard' :
    '/clipper/dashboard';

  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#070b13] text-[#f8fafc] font-sans pb-16 md:pb-0">
        <Providers>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151'
              }
            }} 
          />

          <Navbar user={user} walletBalance={walletBalance} dashboardUrl={dashboardUrl} />

          {/* ── Main ────────────────────────────────── */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-10">
            {children}
          </main>

          <Footer />

        </Providers>
      </body>
    </html>
  );
}
