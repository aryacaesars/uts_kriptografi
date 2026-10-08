import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KriptoLab | UTS Kriptografi",
  description: "Laboratorium cipher klasik dan enkripsi berkas UTS Kriptografi Universitas Siliwangi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
