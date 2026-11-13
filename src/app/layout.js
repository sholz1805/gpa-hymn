import "./globals.css";

export const metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GPA Hymns",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f3f9" },
    { media: "(prefers-color-scheme: dark)", color: "#111722" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
