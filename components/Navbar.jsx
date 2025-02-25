import Link from "next/link";

const Navbar = () => {
  return (
    <div
      className="fixed top-0 left-0 right-0 bg-black flex items-center justify-between py-4 pl-8 z-50"
      dir="rtl"
    >
      <Link href="/about" className="mx-4 text-white">
        התחבר
      </Link>
      <Link href="/" className="mx-4 text-white">
        דף הבית
      </Link>
    </div>
  );
};

export default Navbar;
