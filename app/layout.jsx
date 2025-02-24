import { Rubik } from "next/font/google";
import "./globals.css";

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
    </html>
  );
}
