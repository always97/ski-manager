// app/money/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { deleteItem } from "./actions"; // 삭제 액션

export const dynamic = "force-dynamic";

const MoneyPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. 강습 기록 (수입) - time_slot 추가로 가져오기
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, date, income, type, time_slot, created_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // 2. 수령 기록 (지출/정산)
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("id, date, amount, memo, created_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // 3. 데이터 합치기 & 정렬
  const history = [
    ...(lessons || []).map((l) => ({ ...l, category: "INCOME" })),
    ...(withdrawals || []).map((w) => ({ ...w, category: "WITHDRAWAL" })),
  ].sort((a, b) => {
    if (a.date !== b.date)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalIncome = lessons?.reduce((sum, item) => sum + item.income, 0) || 0;
  const totalWithdrawn =
    withdrawals?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const balance = totalIncome - totalWithdrawn;

  // 시간대별 텍스트와 이모지 헬퍼 함수
  const getTimeInfo = (slot: string) => {
    switch (slot) {
      case "AM":
        return {
          label: "오전",
          emoji: "☀️",
          color: "text-orange-500 bg-orange-50",
        };
      case "PM":
        return {
          label: "오후",
          emoji: "⛅",
          color: "text-yellow-600 bg-yellow-50",
        };
      case "NIGHT":
        return {
          label: "야간",
          emoji: "🌙",
          color: "text-indigo-600 bg-indigo-50",
        };
      default:
        return { label: "", emoji: "", color: "" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단 요약 카드 */}
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h1 className="text-xl font-bold mb-6">정산 관리 📒</h1>
        <div className="flex flex-col items-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            Current Balance
          </p>
          <h2
            className={`text-4xl font-extrabold mb-8 ${balance < 0 ? "text-red-500" : "text-blue-600"}`}
          >
            {balance.toLocaleString()}{" "}
            <span className="text-xl text-gray-800 font-normal">원</span>
          </h2>
          <div className="flex w-full gap-3">
            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold mb-1">
                총 수익
              </p>
              <p className="font-bold text-gray-800">
                {totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold mb-1">
                총 수령액
              </p>
              <p className="font-bold text-red-500">
                -{totalWithdrawn.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 mt-8 mb-4">
        <h3 className="font-bold text-lg text-gray-800">전체 내역</h3>
        <Link
          href="/money/add"
          className="bg-black text-white text-[11px] px-3 py-1.5 rounded-full flex items-center font-bold shadow-md active:scale-95 transition-transform"
        >
          <Plus size={14} className="mr-1" /> 수령 기록
        </Link>
      </div>

      {/* 내역 리스트 */}
      <div className="px-6 space-y-3">
        {history.length > 0 ? (
          history.map((item: any) => {
            const timeInfo =
              item.category === "INCOME" ? getTimeInfo(item.time_slot) : null;

            return (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50 relative overflow-hidden group"
              >
                <div className="flex items-center gap-3">
                  {/* 왼쪽 아이콘 */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.category === "INCOME"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {item.category === "INCOME" ? (
                      <ArrowDownLeft size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-gray-800 text-[14px]">
                        {item.category === "INCOME"
                          ? `${item.type === "SKI" ? "⛷️ 스키" : "🏂 보드"}`
                          : item.memo || "정산 수령"}
                      </p>

                      {/* ⭐ 시간대 뱃지 추가 ⭐ */}
                      {item.category === "INCOME" && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${timeInfo?.color}`}
                        >
                          {timeInfo?.emoji} {timeInfo?.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-[15px] ${
                      item.category === "INCOME"
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    {item.category === "INCOME" ? "+" : "-"}
                    {(item.income || item.amount).toLocaleString()}
                  </span>

                  {/* 삭제 버튼 */}
                  <form
                    action={async () => {
                      "use server";
                      await deleteItem(
                        item.id,
                        item.category === "INCOME" ? "lesson" : "withdrawal",
                      );
                    }}
                  >
                    <button className="text-gray-200 hover:text-red-400 p-1 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-400 text-sm">
            내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyPage;
