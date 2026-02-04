"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const submitLesson = async (
  formData: FormData,
  selectedSlots: string[],
) => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 해제되었습니다. 다시 로그인해주세요.");

  const type = formData.get("type") as string;
  const date = formData.get("date") as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const income =
    type === "SKI" ? profile?.rate_ski || 0 : profile?.rate_board || 0;

  let insertedCount = 0;
  let duplicateCount = 0;

  // 모든 선택된 시간대를 순회
  for (const slot of selectedSlots) {
    const { data: exists } = await supabase
      .from("lessons")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("time_slot", slot)
      .single();

    if (exists) {
      duplicateCount++; // 중복 횟수 체크
      continue;
    }

    const { error } = await supabase.from("lessons").insert({
      user_id: user.id,
      date,
      type,
      time_slot: slot,
      income,
    });

    if (!error) insertedCount++;
  }

  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/ranking");

  return {
    success: true,
    insertedCount,
    duplicateCount,
    totalRequested: selectedSlots.length,
  };
};
