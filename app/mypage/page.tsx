"use client";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Users, Banknote } from "lucide-react";

const MyPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, [router, supabase]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const result = await updateProfile(formData);

    if (result.success) {
      toast.success("정보가 성공적으로 업데이트되었습니다! ✨");
      router.push("/");
      router.refresh(); // 최신 데이터 반영을 위해 리프레시
    } else {
      toast.error(result.error || "수정에 실패했습니다.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다.");
    router.push("/login");
  };

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 gap-2">
        <Loader2 className="animate-spin" />
        <p className="text-sm font-medium">프로필 불러오는 중...</p>
      </div>
    );

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">설정 ⚙️</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          내 정보와 강습비를 관리하세요
        </p>
      </header>

      <form action={handleSubmit} className="space-y-8">
        {/* 기본 정보 섹션 */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Basic Info
          </h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                <User size={16} /> 강사 이름
              </label>
              <input
                name="username"
                type="text"
                defaultValue={profile.username}
                placeholder="이름을 입력하세요"
                required
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                <Users size={16} /> 소속 팀명
              </label>
              <input
                name="team_name"
                type="text"
                defaultValue={profile.team_name}
                placeholder="팀명을 입력하세요"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
              />
            </div>
          </div>
        </section>

        {/* 강습 단가 섹션 */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Rates per Lesson
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                ⛷️ 스키 단가
              </label>
              <div className="relative">
                <input
                  name="rate_ski"
                  type="number"
                  defaultValue={profile.rate_ski}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
                />
                <span className="absolute right-4 top-4 text-gray-400 text-sm font-bold">
                  원
                </span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                🏂 보드 단가
              </label>
              <div className="relative">
                <input
                  name="rate_board"
                  type="number"
                  defaultValue={profile.rate_board}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
                />
                <span className="absolute right-4 top-4 text-gray-400 text-sm font-bold">
                  원
                </span>
              </div>
            </div>
          </div>
        </section>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : "변경사항 저장하기"}
        </button>
      </form>
      <button
        onClick={handleLogout}
        className="w-full mt-8 flex items-center justify-center gap-2 text-gray-400 font-bold py-4 hover:text-red-500 transition-colors"
      >
        <LogOut size={18} /> 로그아웃 하기
      </button>
    </div>
  );
};

export default MyPage;
