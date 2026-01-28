import type { Metadata, Viewport } from "next"; // Viewport 추가
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "강습마스터 - 강사 정산 관리",
  description: "스키/보드 강습비 정산 및 랭킹 시스템",
};

// ⭐ viewport를 별도로 export 합니다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <main className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative pb-20">
          {children}
          <BottomNav />
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
