import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "パスワード生成",
  description:
    "ブラウザー内で完結するパスワード生成。生成したパスワードは保存・送信しません。",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
