import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { deleteItem } from "./actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ month?: string }>;
}

// 날짜 포맷팅 헬퍼
const formatYM = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const MoneyPage = async (props: Props) => {
  const searchParams = await props.searchParams;
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

  // --- 날짜 계산 로직 ---
  const today = new Date();
  const currentMonthStr = searchParams.month || formatYM(today);
  const [year, month] = currentMonthStr.split("-").map(Number);

  // 필터링 범위 (해당 월 1일 ~ 다음 달 1일 미만)
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const nextMonthDate = new Date(year, month, 1).toISOString().split("T")[0];

  // 네비게이션용 날짜
  const prevMonthStr = formatYM(new Date(year, month - 2, 1));
  const nextMonthStr = formatYM(new Date(year, month, 1));

  // --- 데이터 가져오기 ---

  // 1. 상단 카드용 전체 누적 데이터
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("income")
    .eq("user_id", user.id);
  const { data: allWithdrawals } = await supabase
    .from("withdrawals")
    .select("amount")
    .eq("user_id", user.id);

  const totalIncome =
    allLessons?.reduce((sum, item) => sum + (item.income ?? 0), 0) || 0;
  const totalWithdrawn =
    allWithdrawals?.reduce((sum, item) => sum + (item.amount ?? 0), 0) || 0;
  const balance = totalIncome - totalWithdrawn;

  // 2. 하단 리스트용 월별 데이터 (날짜 필터 추가)
  const { data: monthlyLessons } = await supabase
    .from("lessons")
    .select("id, date, income, type, time_slot, created_at")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", nextMonthDate)
    .order("date", { ascending: false });

  const { data: monthlyWithdrawals } = await supabase
    .from("withdrawals")
    .select("id, date, amount, memo, created_at")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", nextMonthDate)
    .order("date", { ascending: false });

  // 3. 데이터 통합 및 정렬
  const history = [
    ...(monthlyLessons || []).map((l) => ({ ...l, category: "INCOME" })),
    ...(monthlyWithdrawals || []).map((w) => ({
      ...w,
      category: "WITHDRAWAL",
    })),
  ].sort((a, b) => {
    if (a.date !== b.date)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 시간대별 정보 헬퍼
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
      {/* 상단 요약 카드 (기존 유지) */}
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h1 className="text-xl font-bold mb-6">정산 관리 📒</h1>
        <div className="flex flex-col items-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
            현재 잔액
          </p>
          <h2
            className={`text-4xl font-black mb-8 ${balance < 0 ? "text-red-500" : "text-blue-600"}`}
          >
            {balance.toLocaleString()}{" "}
            <span className="text-xl text-gray-800 font-normal ml-1">원</span>
          </h2>
          <div className="flex w-full gap-3">
            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">
                누적 수익
              </p>
              <p className="font-bold text-gray-800">
                {totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">
                누적 정산액
              </p>
              <p className="font-bold text-red-500">
                -{totalWithdrawn.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 월 선택 네비게이션 (전체 내역 타이틀 대신 들어감) */}
      <div className="flex justify-between items-center px-6 mt-8 mb-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/money?month=${prevMonthStr}`}
            className="p-1 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-1.5 font-bold text-gray-800">
            <Calendar size={16} className="text-blue-600" />
            <span>
              {year}년 {month}월
            </span>
          </div>
          <Link
            href={`/money?month=${nextMonthStr}`}
            className="p-1 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronRight size={20} />
          </Link>
        </div>

        <Link
          href="/money/add"
          className="bg-black text-white text-[11px] px-3 py-1.5 rounded-full flex items-center font-bold shadow-lg active:scale-95 transition-all uppercase tracking-tighter"
        >
          <Plus size={14} className="mr-1" /> 정산금 등록
        </Link>
      </div>

      {/* 내역 리스트 (기존 유지) */}
      <div className="px-6 space-y-3">
        {history.length > 0 ? (
          history.map((item: any) => {
            const timeInfo =
              item.category === "INCOME" ? getTimeInfo(item.time_slot) : null;
            const displayAmount =
              item.category === "INCOME"
                ? (item.income ?? 0)
                : (item.amount ?? 0);

            return (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50 relative overflow-hidden group"
              >
                <div className="flex items-center gap-3">
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

                      {item.category === "INCOME" && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${timeInfo?.color}`}
                        >
                          {timeInfo?.emoji} {timeInfo?.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">
                      {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-[15px] ${item.category === "INCOME" ? "text-blue-600" : "text-gray-900"}`}
                  >
                    {item.category === "INCOME" ? "+" : "-"}
                    {displayAmount.toLocaleString()}
                  </span>

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
          <div className="text-center py-24 text-gray-300">
            <p className="text-xs font-bold uppercase italic">
              이 달의 기록이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyPage;
