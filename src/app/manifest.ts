import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "همراه — پلتفرم پشتیبانی کودکان مبتلا به سرطان",
    short_name: "همراه",
    description:
      "پایش و پشتیبانی روانی-اجتماعی، آموزشی و مالی کودکان مبتلا به سرطان و خانواده‌های آن‌ها.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9f8",
    theme_color: "#1c7d76",
    dir: "rtl",
    lang: "fa",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
