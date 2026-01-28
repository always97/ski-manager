"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 가짜 도메인 (사용자는 몰라도 됨)
const EMAIL_DOMAIN = "@ski.team";

export async function login(formData: FormData) {
  // Next.js 15에서는 cookies() 앞에 await가 필수입니다.
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 액션에서 쿠키 설정 에러 무시
          }
        },
      },
    },
  );

  const rawId = formData.get("id") as string;
  const password = formData.get("password") as string;

  // 아이디를 이메일 형식으로 변환
  const email = rawId + EMAIL_DOMAIN;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error); // 에러 확인용 로그
    return { error: "로그인 실패: 아이디와 비밀번호를 확인해주세요." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 무시
          }
        },
      },
    },
  );

  const rawId = formData.get("id") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const teamName = formData.get("team_name") as string; // 팀명 추가

  // 아이디를 이메일 형식으로 변환
  const email = rawId + EMAIL_DOMAIN;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        team_name: teamName || "무소속", // 팀명 저장
      },
    },
  });

  if (error) {
    console.error(error);
    return { error: "가입 실패: 이미 있는 아이디입니다." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
