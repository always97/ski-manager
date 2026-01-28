"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteItem(id: string, type: "lesson" | "withdrawal") {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 테이블 이름 결정 (lessons 또는 withdrawals)
  const tableName = type === "lesson" ? "lessons" : "withdrawals";

  // 삭제 실행 (내 아이디와 일치하는 것만 삭제 가능)
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) console.error("삭제 실패", error);

  revalidatePath("/money");
  revalidatePath("/");
  revalidatePath("/ranking");
}
