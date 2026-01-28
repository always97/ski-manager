import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Trophy, Medal, Crown } from "lucide-react";

// 캐싱 방지 (실시간 랭킹 반영)
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

const RankingPage = async (props: Props) => {
  // 1. Next.js 15 방식: searchParams await 처리
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || "weekly";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  // 2. 날짜 필터 설정 (주간 랭킹용)
  const getMondayOfThisWeek = () => {
    const now = new Date();
    const day = now.getDay() || 7; // 일요일을 7로 취급
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - day + 1);

    // 로컬 ISO 날짜 반환 (YYYY-MM-DD)
    const offset = monday.getTimezoneOffset() * 60000;
    return new Date(monday.getTime() - offset).toISOString().split("T")[0];
  };

  // 3. 쿼리 빌드
  let query = supabase.from("lessons").select(`
      user_id,
      profiles (
        username,
        team_name
      )
    `);

  // ⭐ 주간 탭일 때만 날짜 필터 적용
  if (tab === "weekly") {
    const startOfThisWeek = getMondayOfThisWeek();
    query = query.gte("date", startOfThisWeek);
  }

  const { data: lessons, error } = await query;
  if (error) console.error("Ranking Fetch Error:", error);

  // 4. 데이터 집계 (사용자별 강습 횟수 카운트)
  const rankingMap = new Map();

  lessons?.forEach((lesson: any) => {
    const uid = lesson.user_id;
    if (!rankingMap.has(uid)) {
      rankingMap.set(uid, {
        id: uid,
        name: lesson.profiles?.username || "알 수 없음",
        team: lesson.profiles?.team_name || "무소속",
        count: 0,
      });
    }
    rankingMap.get(uid).count += 1;
  });

  // 5. 정렬 (횟수 많은 순)
  const rankingList = Array.from(rankingMap.values()).sort(
    (a: any, b: any) => b.count - a.count,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단 헤더 */}
      <div className="bg-white p-6 pb-4 shadow-sm border-b border-gray-100">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          명예의 전당{" "}
          <Crown className="text-yellow-500" size={24} fill="currentColor" />
        </h1>
        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">
          Hall of Fame
        </p>
      </div>

      {/* 탭 버튼 (중요: Link 태그 대신 단순 a 태그 혹은 Link로 처리) */}
      <div className="flex p-4 gap-2">
        <a
          href="/ranking?tab=weekly"
          className={`flex-1 py-3 text-center font-bold rounded-2xl transition-all text-sm ${
            tab === "weekly"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
              : "bg-white text-gray-400 border border-gray-100"
          }`}
        >
          📅 이번 주
        </a>
        <a
          href="/ranking?tab=all"
          className={`flex-1 py-3 text-center font-bold rounded-2xl transition-all text-sm ${
            tab === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
              : "bg-white text-gray-400 border border-gray-100"
          }`}
        >
          🏆 전체 누적
        </a>
      </div>

      {/* 랭킹 리스트 */}
      <div className="px-4 space-y-3">
        {rankingList.length > 0 ? (
          rankingList.map((ranker: any, index: number) => {
            const isTop3 = index < 3;
            let badge;
            if (index === 0)
              badge = (
                <Medal
                  className="text-yellow-400 w-8 h-8"
                  fill="currentColor"
                />
              );
            else if (index === 1)
              badge = (
                <Medal className="text-slate-300 w-7 h-7" fill="currentColor" />
              );
            else if (index === 2)
              badge = (
                <Medal className="text-amber-600 w-6 h-6" fill="currentColor" />
              );
            else
              badge = (
                <span className="text-gray-300 font-black w-6 text-center">
                  {index + 1}
                </span>
              );

            return (
              <div
                key={ranker.id}
                className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-md"
                    : "bg-white border-gray-50 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">{badge}</div>
                  <div>
                    <p
                      className={`font-bold ${index === 0 ? "text-lg text-gray-900" : "text-gray-700"}`}
                    >
                      {ranker.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      {ranker.team}팀
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p
                    className={`text-xl font-black ${index === 0 ? "text-blue-600" : "text-gray-800"}`}
                  >
                    {ranker.count}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    Lessons
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 text-gray-300">
            <p className="text-4xl mb-4">⛷️</p>
            <p className="font-bold text-sm tracking-tighter">
              아직 집계된 랭킹이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;
