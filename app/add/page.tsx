"use client";

import { useState } from "react";
import { submitLesson } from "./actions"; // 곧 만들 파일
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 오늘 날짜를 기본값으로 (YYYY-MM-DD 형식)
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await submitLesson(formData);
      toast.success("강습이 등록되었습니다! 💰");
      router.push("/");
    } catch (error: any) {
      // ⭐ 서버에서 throw Error 한 메시지가 여기 error.message로 들어옵니다.
      toast.error(error.message || "등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">강습 등록하기 📝</h1>

      <form action={handleSubmit} className="space-y-8">
        {/* 1. 날짜 선택 */}
        <div>
          <label className="block font-medium mb-2 text-gray-600">날짜</label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="w-full p-4 bg-gray-100 rounded-xl font-bold text-lg"
          />
        </div>

        {/* 2. 종목 선택 (라디오 버튼을 디자인해서 버튼처럼 보이게 함) */}
        <div>
          <label className="block font-medium mb-3 text-gray-600">종목</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value="SKI"
                className="peer hidden"
                defaultChecked
              />
              <div className="p-4 rounded-xl border-2 text-center font-bold text-gray-400 border-gray-200 peer-checked:border-blue-600 peer-checked:text-blue-600 peer-checked:bg-blue-50 transition-all">
                ⛷️ 스키
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value="BOARD"
                className="peer hidden"
              />
              <div className="p-4 rounded-xl border-2 text-center font-bold text-gray-400 border-gray-200 peer-checked:border-blue-600 peer-checked:text-blue-600 peer-checked:bg-blue-50 transition-all">
                🏂 보드
              </div>
            </label>
          </div>
        </div>

        {/* 3. 시간 선택 */}
        <div>
          <label className="block font-medium mb-3 text-gray-600">시간</label>
          <div className="grid grid-cols-3 gap-3">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="time_slot"
                value="AM"
                className="peer hidden"
                defaultChecked
              />
              <div className="py-4 rounded-xl border-2 text-center font-bold text-gray-400 border-gray-200 peer-checked:border-orange-500 peer-checked:text-orange-500 peer-checked:bg-orange-50 transition-all">
                ☀️ 오전
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="time_slot"
                value="PM"
                className="peer hidden"
              />
              <div className="py-4 rounded-xl border-2 text-center font-bold text-gray-400 border-gray-200 peer-checked:border-orange-500 peer-checked:text-orange-500 peer-checked:bg-orange-50 transition-all">
                ⛅ 오후
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="time_slot"
                value="NIGHT"
                className="peer hidden"
              />
              <div className="py-4 rounded-xl border-2 text-center font-bold text-gray-400 border-gray-200 peer-checked:border-purple-600 peer-checked:text-purple-600 peer-checked:bg-purple-50 transition-all">
                🌙 야간
              </div>
            </label>
          </div>
        </div>

        {/* 4. 등록 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl text-xl shadow-lg active:scale-95 transition-transform flex justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "등록 완료"}
        </button>
      </form>
    </div>
  );
}
