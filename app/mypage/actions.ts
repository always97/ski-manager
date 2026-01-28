"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const updateProfile = async (formData: FormData) => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };

  // 폼 데이터 가져오기
  const username = formData.get("username") as string; // 이름 추가
  const team_name = formData.get("team_name") as string; // 팀명 추가
  const rate_ski = Number(formData.get("rate_ski"));
  const rate_board = Number(formData.get("rate_board"));

  // DB 업데이트
  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      team_name,
      rate_ski,
      rate_board,
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  // 캐시 갱신 (홈화면과 랭킹에 바뀐 이름이 바로 나오도록)
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/mypage");

  return { success: true };
};
