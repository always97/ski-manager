"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitWithdrawal(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const date = formData.get("date");
  const amount = formData.get("amount");
  const memo = formData.get("memo");

  const { error } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    date,
    amount: Number(amount),
    memo,
  });

  if (error) console.error(error);

  revalidatePath("/money");
  revalidatePath("/"); // 홈 화면 잔액에도 영향 줄 수 있으니 갱신
}
