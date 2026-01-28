"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Wallet, Trophy, UserCog } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  // 현재 경로와 비교해서 활성화된 아이콘 색상 변경
  const isActive = (path: string) =>
    pathname === path ? "text-blue-600" : "text-gray-400";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {/* 1. 홈 (대시보드) */}
        <Link
          href="/"
          className={`flex flex-col items-center p-2 ${isActive("/")}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">홈</span>
        </Link>

        {/* 2. 내역 (돈 관리) */}
        <Link
          href="/money"
          className={`flex flex-col items-center p-2 ${isActive("/money")}`}
        >
          <Wallet size={24} />
          <span className="text-xs mt-1">내역</span>
        </Link>

        {/* 3. 등록 (가운데 강조된 버튼) */}
        <Link href="/add" className="flex flex-col items-center p-2 -mt-6">
          <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
            <PlusCircle size={32} />
          </div>
          <span className="text-xs mt-1 text-gray-500">등록</span>
        </Link>

        {/* 4. 랭킹 */}
        <Link
          href="/ranking"
          className={`flex flex-col items-center p-2 ${isActive("/ranking")}`}
        >
          <Trophy size={24} />
          <span className="text-xs mt-1">랭킹</span>
        </Link>

        {/* 5. 마이페이지(설정) - 필요시 추가 */}
        {/* 5. 설정 (추가됨) */}
        <Link
          href="/mypage"
          className={`flex flex-col items-center p-2 ${isActive("/mypage")}`}
        >
          <UserCog size={24} />
          <span className="text-xs mt-1">설정</span>
        </Link>
      </div>
    </div>
  );
}
