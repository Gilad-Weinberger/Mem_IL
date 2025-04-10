import { Rubik } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/context/AuthContext";

const rubik = Rubik({
  subsets: ["latin"],
  weights: ["400", "700"],
});

export const metadata = {
  title: "Memoery IL",
  description: "Memory of the killed soldiers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${rubik.className}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
