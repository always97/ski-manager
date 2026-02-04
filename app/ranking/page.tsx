import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Crown,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ tab?: string; date?: string }>;
}

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekDetail = (date: Date) => {
  const target = new Date(date);
  const day = target.getDay() || 7;

  const monday = new Date(target);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(target.getDate() - day + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const firstDayOfMonth = new Date(monday.getFullYear(), monday.getMonth(), 1);
  const weekNumber = Math.ceil(
    (monday.getDate() + (firstDayOfMonth.getDay() || 7) - 1) / 7,
  );

  return {
    monday,
    sunday,
    month: monday.getMonth() + 1,
    weekNumber,
    rangeStr: `${monday.getMonth() + 1}.${monday.getDate()} ~ ${sunday.getMonth() + 1}.${sunday.getDate()}`,
  };
};

const RankingPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || "weekly";
  const dateParam = searchParams.date;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const baseDate = dateParam ? new Date(dateParam) : new Date();
  const { monday, sunday, month, weekNumber, rangeStr } =
    getWeekDetail(baseDate);

  const prevWeek = new Date(monday);
  prevWeek.setDate(monday.getDate() - 7);
  const nextWeek = new Date(monday);
  nextWeek.setDate(monday.getDate() + 7);

  let query = supabase
    .from("lessons")
    .select(`user_id, profiles(username, team_name)`);

  if (tab === "weekly") {
    query = query
      .gte("date", formatDate(monday))
      .lte("date", formatDate(sunday));
  }

  const { data: lessons } = await query;

  const rankingMap = new Map();
  lessons?.forEach((l: any) => {
    const uid = l.user_id;
    if (!rankingMap.has(uid)) {
      rankingMap.set(uid, {
        id: uid,
        name: l.profiles?.username,
        team: l.profiles?.team_name,
        count: 0,
      });
    }
    rankingMap.get(uid).count += 1;
  });

  const rankingList = Array.from(rankingMap.values()).sort(
    (a: any, b: any) => b.count - a.count,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-6 pb-4 border-b">
        <h1 className="text-2xl font-black flex items-center gap-2 text-gray-800">
          명예의 전당{" "}
          <Crown className="text-yellow-500" size={24} fill="currentColor" />
        </h1>
      </div>

      {/* ⭐ 탭 버튼 영역 (아이콘 추가됨) */}
      <div className="flex p-4 gap-2">
        <Link
          href="/ranking?tab=weekly"
          className={`flex-1 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
            tab === "weekly"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-white text-gray-400 border border-gray-100"
          }`}
        >
          <Calendar size={16} />
          주간 랭킹
        </Link>
        <Link
          href="/ranking?tab=all"
          className={`flex-1 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
            tab === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-white text-gray-400 border border-gray-100"
          }`}
        >
          <Trophy size={16} />
          전체 누적
        </Link>
      </div>

      {tab === "weekly" && (
        <div className="flex justify-between items-center px-6 mb-4">
          <Link
            href={`/ranking?tab=weekly&date=${formatDate(prevWeek)}`}
            className="p-2 bg-white rounded-full border shadow-sm text-gray-400 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="text-center flex flex-col items-center">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">
              {month}월 {weekNumber}주차
            </p>
            <p className="text-sm font-bold text-gray-800 tracking-tight">
              {rangeStr}
            </p>
          </div>
          <Link
            href={`/ranking?tab=weekly&date=${formatDate(nextWeek)}`}
            className="p-2 bg-white rounded-full border shadow-sm text-gray-400 active:scale-90 transition-transform"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      )}

      <div className="px-4 space-y-3 mt-2">
        {rankingList.length > 0 ? (
          rankingList.map((ranker, index) => {
            let badge;
            if (index === 0)
              badge = (
                <Medal
                  className="text-yellow-400"
                  size={28}
                  fill="currentColor"
                />
              );
            else if (index === 1)
              badge = (
                <Medal
                  className="text-gray-300"
                  size={24}
                  fill="currentColor"
                />
              );
            else if (index === 2)
              badge = (
                <Medal
                  className="text-amber-600"
                  size={20}
                  fill="currentColor"
                />
              );
            else
              badge = (
                <span className="text-gray-300 font-black w-8 text-center text-sm">
                  {index + 1}
                </span>
              );

            return (
              <div
                key={ranker.id}
                className={`flex items-center justify-between p-5 rounded-[2.5rem] border transition-all ${index === 0 ? "bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-md" : "bg-white border-gray-50 shadow-sm"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">{badge}</div>
                  <div>
                    <p
                      className={`font-bold ${index === 0 ? "text-lg text-gray-900" : "text-sm text-gray-700"}`}
                    >
                      {ranker.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      {ranker.team}팀
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-black ${index === 0 ? "text-blue-600" : "text-gray-800"}`}
                  >
                    {ranker.count}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    Lessons
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-300">
            <p className="text-4xl mb-2 opacity-20">🎿</p>
            <p className="text-xs font-bold uppercase tracking-widest italic">
              No records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;
