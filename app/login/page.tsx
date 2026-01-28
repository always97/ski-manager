"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMsg("");

    const action = isLogin ? login : signup;
    const result = await action(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            강습마스터 ⛷️
          </h1>
          <p className="text-gray-500">강습 정산 관리 사이트</p>
        </div>

        {/* 탭 버튼 */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin ? "bg-white shadow text-gray-900" : "text-gray-500"
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin ? "bg-white shadow text-gray-900" : "text-gray-500"
            }`}
          >
            회원가입
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (사용할 닉네임)
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  소속 팀명
                </label>
                <input
                  name="team_name"
                  type="text"
                  placeholder="예: A팀"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이디
            </label>
            <input
              name="id"
              type="text"
              required
              placeholder="아이디 입력"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 (6자리 이상)
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="******"
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              "입장하기"
            ) : (
              "등록하기"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
