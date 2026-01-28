import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "스키강사 정산관리",
  description: "강습비 관리 및 랭킹 시스템",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  // ↑ 모바일 확대/축소 막아서 앱처럼 느끼게 함
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 모바일 화면 중앙 정렬을 위한 컨테이너 */}
        <main className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative pb-20">
          {children}

          {/* 하단 탭바 (로그인 페이지에서는 안보이게 처리하는 로직을 나중에 추가할 예정) */}
          <BottomNav />
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
