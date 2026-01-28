import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "스키마스터 - 강사 정산",
    short_name: "스키마스터",
    description: "스키 강습 정산 및 랭킹 서비스",
    start_url: "/",
    display: "standalone", //주소창 없어짐
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
