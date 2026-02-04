"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Calendar, Banknote, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { submitWithdrawal } from "./actions";

const AddWithdrawalPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsLoading(true);
    try {
      await submitWithdrawal(formData);
      toast.success("기록이 완료되었습니다! 💸");
      router.push("/money");
      router.refresh(); // 최신 데이터 반영
    } catch (error) {
      toast.error("저장에 실패했습니다. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 relative animate-in fade-in duration-500">
      {/* --- 헤더 영역 --- */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            수령액 기록 💸
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1 leading-tight">
            주급이나 가불 등 <br />
            실제로 받은 금액을 기록하세요.
          </p>
        </div>

        {/* 우측 상단 X 버튼 */}
        <button
          onClick={() => router.back()}
          type="button"
          className="p-2 -mr-2 text-gray-300 hover:text-gray-600 transition-colors"
        >
          <X size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* --- 입력 폼 --- */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 날짜 입력 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
            <Calendar size={14} /> 날짜
          </label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold text-lg transition-all outline-none"
          />
        </div>

        {/* 금액 입력 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
            <Banknote size={14} /> 금액
          </label>
          <div className="relative">
            <input
              name="amount"
              type="number"
              placeholder="0"
              required
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-black text-2xl transition-all outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              원
            </span>
          </div>
        </div>

        {/* 메모 입력 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
            <StickyNote size={14} /> 메모 (선택)
          </label>
          <input
            name="memo"
            type="text"
            placeholder="예: 1월 1주차 주급"
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
          />
        </div>

        {/* 하단 저장 버튼 */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>저장 중...</span>
              </>
            ) : (
              "기록 저장하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWithdrawalPage;
