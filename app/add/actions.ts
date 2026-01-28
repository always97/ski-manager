"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const submitLesson = async (formData: FormData) => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const type = formData.get("type") as string;
  const date = formData.get("date") as string;
  const timeSlot = formData.get("time_slot") as string;

  // ⭐ [중복 체크 로직 추가]
  // 같은 날짜(date)와 같은 시간대(time_slot)에 내가 올린 기록이 있는지 확인
  const { data: existingLesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .eq("time_slot", timeSlot)
    .single();

  if (existingLesson) {
    // 이미 데이터가 있다면 에러를 던짐
    throw new Error(
      "이미 해당 시간대에 등록된 강습이 있습니다. 확인해주세요! 🧐",
    );
  }

  // 내 프로필에서 단가 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("rate_ski, rate_board")
    .eq("id", user.id)
    .single();

  const income =
    type === "SKI" ? profile?.rate_ski || 0 : profile?.rate_board || 0;

  const { error } = await supabase.from("lessons").insert({
    user_id: user.id,
    date,
    type,
    time_slot: timeSlot,
    income,
  });

  if (error) throw new Error("등록 중 오류가 발생했습니다.");

  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/ranking");
};
