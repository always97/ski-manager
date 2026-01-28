import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/middleware"; // 곧 만들 파일

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래 경로들은 미들웨어를 거치지 않음 (이미지, 로그인페이지 등)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|auth).*)",
  ],
};
