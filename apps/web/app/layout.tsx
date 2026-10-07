import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Club Bionda y Mora",
  description: "Un lugar para celebrar cada paso contigo."
};

export const viewport: Viewport = { themeColor: "#f4f0e8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
