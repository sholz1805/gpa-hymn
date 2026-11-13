export default function manifest() {
  return {
    name: "GPA Church Hymn Book",
    short_name: "GPA Hymns",
    description: "Browse and save Gospel Pentecostal Assembly hymns.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f3f9",
    theme_color: "#3159ad",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}