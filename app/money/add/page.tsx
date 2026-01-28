"use client";

import { useState } from "react";
import { submitWithdrawal } from "./actions"; // 곧 만들 파일
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddWithdrawalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    await submitWithdrawal(formData);
    toast.success("기록되었습니다! 💸");
    router.push("/money"); // 내역 페이지로 돌아감
    setIsLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">수령액 기록하기 💸</h1>
      <p className="text-gray-500 mb-8 text-sm">
        주급이나 가불 등 <br />
        팀장님께 <strong>받은 돈</strong>을 기록해주세요.
      </p>

      <form action={handleSubmit} className="space-y-6">
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

        <div>
          <label className="block font-medium mb-2 text-gray-600">
            받은 금액
          </label>
          <div className="relative">
            <input
              name="amount"
              type="number"
              placeholder="0"
              required
              className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-xl focus:border-blue-600 focus:outline-none"
            />
            <span className="absolute right-4 top-4 text-gray-400 font-bold">
              원
            </span>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-600">
            메모 (선택)
          </label>
          <input
            name="memo"
            type="text"
            placeholder="예: 1월 1주차 주급"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white font-bold py-5 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform flex justify-center mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "저장하기"}
        </button>
      </form>
    </div>
  );
}
