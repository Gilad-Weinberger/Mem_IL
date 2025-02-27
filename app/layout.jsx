import { Rubik } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

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
      <body className={`${rubik.className} `}>{children}</body>
      <GoogleAnalytics gaId="G-F1DZ58FE02" />
    </html>
  );
}
