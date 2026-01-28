import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  ChevronLeft,
  Wallet,
  ArrowUpRight,
  Banknote,
} from "lucide-react";

export const dynamic = "force-dynamic";

const formatYM = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

interface Props {
  searchParams: Promise<{ month?: string }>;
}

const Home = async (props: Props) => {
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
  if (!user) redirect("/login");

  // --- 날짜 계산 로직 ---
  const today = new Date();
  const currentMonthStr = searchParams?.month || formatYM(today);
  const [cYear, cMonth] = currentMonthStr.split("-").map(Number);
  const startOfMonth = new Date(cYear, cMonth - 1, 1);
  const nextMonthStart = new Date(cYear, cMonth, 1);

  const getLocalISO = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  };

  const startStr = getLocalISO(startOfMonth);
  const endStr = getLocalISO(nextMonthStart);

  const prevDate = new Date(startOfMonth);
  prevDate.setMonth(startOfMonth.getMonth() - 1);
  const nextDate = new Date(startOfMonth);
  nextDate.setMonth(startOfMonth.getMonth() + 1);

  const prevMonthStr = formatYM(prevDate);
  const nextMonthStr = formatYM(nextDate);

  // --- 데이터 불러오기 ---

  // 1. 프로필
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. [이번 달] 강습 기록
  const { data: monthlyLessons } = await supabase
    .from("lessons")
    .select("income")
    .eq("user_id", user.id)
    .gte("date", startStr)
    .lt("date", endStr);
  const monthlyTotal =
    monthlyLessons?.reduce((sum, item) => sum + item.income, 0) || 0;
  const monthlyCount = monthlyLessons?.length || 0;

  // 3. [전체 누적] 강습 수익 (All Time)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("income")
    .eq("user_id", user.id);
  const accumulatedIncome =
    allLessons?.reduce((sum, item) => sum + item.income, 0) || 0;

  // 4. [전체 누적] 수령/가불 금액 (All Time)
  const { data: allWithdrawals } = await supabase
    .from("withdrawals")
    .select("amount")
    .eq("user_id", user.id);
  const accumulatedWithdrawal =
    allWithdrawals?.reduce((sum, item) => sum + item.amount, 0) || 0;

  // 5. 순수익 (받을 수 있는 금액)
  const netProfit = accumulatedIncome - accumulatedWithdrawal;

  // 6. 최근 활동 5개
  const { data: recentLessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-6 pb-24">
      {/* 1. 상단 헤더 */}
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">
            {profile?.username || "강사"} 님
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            {profile?.team_name || "무소속"} | 2526 시즌도 화이팅! ❄️
          </p>
        </div>
        <Link
          href="/mypage"
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl hover:bg-gray-200 transition-all"
        >
          ⚙️
        </Link>
      </header>

      {/* 2. 월 수익 카드 (Main) */}
      <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-xl shadow-blue-100 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-3">
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
              {cMonth}월 누적 수익
            </p>
            <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-1 backdrop-blur-md">
              <Link href={`/?month=${prevMonthStr}`} className="p-1">
                <ChevronLeft size={16} />
              </Link>
              <span className="text-xs font-bold min-w-[45px] text-center">
                {cMonth}월
              </span>
              <Link href={`/?month=${nextMonthStr}`} className="p-1">
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            {monthlyTotal.toLocaleString()}
            <span className="text-lg font-light ml-1">원</span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[11px] font-medium">
            이번 달 강습 {monthlyCount}건 완료
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 3. 누적 현황판 (New Section) */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold mb-1">누적 수익</p>
          <p className="text-[13px] font-bold text-gray-800 truncate">
            {accumulatedIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold mb-1">
            정산 & 가불
          </p>
          <p className="text-[13px] font-bold text-red-500 truncate">
            -{accumulatedWithdrawal.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] text-blue-400 font-bold mb-1">남은 금액</p>
          <p className="text-[13px] font-bold text-blue-700 truncate">
            {netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4. 최근 활동 섹션 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">최근 활동</h3>
        <Link
          href="/money"
          className="text-xs text-blue-600 font-bold flex items-center bg-blue-50 px-2 py-1 rounded-lg"
        >
          전체보기 <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {recentLessons && recentLessons.length > 0 ? (
          recentLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl transition-active active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    lesson.type === "SKI"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  {lesson.type === "SKI" ? "⛷️" : "🏂"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-gray-800 text-sm">
                      {lesson.type === "SKI" ? "스키" : "보드"}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        lesson.time_slot === "AM"
                          ? "bg-orange-100 text-orange-600"
                          : lesson.time_slot === "PM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {lesson.time_slot}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium tracking-tighter">
                    {lesson.date}
                  </p>
                </div>
              </div>
              <span className="font-bold text-sm text-blue-600">
                +{lesson.income.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-xs font-medium mb-3">
              아직 강습 기록이 없어요
            </p>
            <Link
              href="/add"
              className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm inline-block"
            >
              첫 강습 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
