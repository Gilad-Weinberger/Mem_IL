import Link from "next/link";

const Navbar = () => {
  return (
    <div
      className="fixed top-0 right-0 w-full bg-black flex items-center justify-between p-4 z-50"
      dir="rtl"
    >
      <Link href="/signup" className="mx-4 text-white">
        התחבר
      </Link>
      <Link href="/" className="mx-4 text-white">
        דף הבית
      </Link>
    </div>
  );
};

export default Navbar;
