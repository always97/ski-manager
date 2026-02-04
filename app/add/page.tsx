"use client";

import { useState } from "react";
import { submitLesson } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

const AddPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["AM"]);

  const today = new Date().toISOString().split("T")[0];

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  // ⭐ action 대신 onSubmit 핸들러로 변경
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 제출 동작 방지

    if (selectedSlots.length === 0) {
      toast.error("시간대를 하나 이상 선택해주세요!");
      return;
    }

    setLoading(true); // 1. 즉시 로딩 시작 (onSubmit에서는 즉시 반영됨)

    try {
      const formData = new FormData(e.currentTarget);
      const result = await submitLesson(formData, selectedSlots);

      if (result.insertedCount === 0 && result.duplicateCount > 0) {
        // 1. 전부 중복인 경우
        toast.error("이미 등록된 강습입니다! 내역을 확인해주세요. 🧐");
        setLoading(false); // 페이지 이동 안 함
      } else if (result.duplicateCount > 0) {
        // 2. 일부만 등록된 경우
        toast.warning(
          `${result.insertedCount}건 등록 완료 (이미 등록된 ${result.duplicateCount}건 제외)`,
        );
        router.push("/");
        router.refresh();
      } else {
        // 3. 전부 새로 등록된 경우
        toast.success(`${result.insertedCount}건의 강습이 등록되었습니다! 💰`);
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24 relative">
      {/* ⭐ 로딩 오버레이 (z-index를 9999로 높임) */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2
              className="animate-spin text-blue-600"
              size={48}
              strokeWidth={3}
            />
            <p className="font-black text-gray-800 text-lg">기록 저장 중...</p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 italic">강습 등록 📝</h1>

      {/* ⭐ action={handleSubmit} 대신 onSubmit={handleSubmit} 사용 */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            날짜
          </label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            종목
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value="SKI"
                className="peer hidden"
                defaultChecked
              />
              <div className="p-4 rounded-2xl border-2 text-center font-bold text-gray-400 border-gray-100 peer-checked:border-blue-600 peer-checked:text-blue-600 peer-checked:bg-blue-50 transition-all">
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
              <div className="p-4 rounded-2xl border-2 text-center font-bold text-gray-400 border-gray-100 peer-checked:border-blue-600 peer-checked:text-blue-600 peer-checked:bg-blue-50 transition-all">
                🏂 보드
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            시간 (다중 선택)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "AM", label: "오전", icon: "☀️" },
              { id: "PM", label: "오후", icon: "⛅" },
              { id: "NIGHT", label: "야간", icon: "🌙" },
            ].map((slot) => {
              const isSelected = selectedSlots.includes(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  className={`relative py-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-[1.02]"
                      : "border-gray-50 bg-gray-50 text-gray-300"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  )}
                  <span className="text-xl">{slot.icon}</span>
                  <span className="text-xs">{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-2xl font-black text-lg bg-blue-600 text-white shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "등록 중..." : "강습 등록 완료"}
        </button>
      </form>
    </div>
  );
};

export default AddPage;
