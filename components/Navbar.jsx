import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setShowLogoutPopup(true);
    setTimeout(() => {
      setShowLogoutPopup(false);
      router.push("/signup"); // Redirect after popup disappears
    }, 1500); // Reduced timeout duration for faster redirection
  };

  return (
    <div>
      <div
        className="fixed top-0 right-0 w-full bg-black flex items-center justify-center h-12 z-50 shadow-md"
        dir="rtl"
      >
        <div className="flex space-x-6 space-x-reverse text-lg">
          <Link href="/soldiers" className="text-white hover:text-gray-300 transition-all">
            דף הבית
          </Link>
          <Link href="/signup" className="text-white hover:text-gray-300 transition-all">
            התחבר
          </Link>
          <button
            onClick={handleLogout}
            className="text-white hover:text-red-500 transition-all"
          >
            התנתק
          </button>
        </div>
      </div>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-center py-3 px-6 text-lg font-semibold shadow-md z-50 animate-slideDown rounded-lg max-w-[350px] w-full">
          <span>התנתקת בהצלחה</span>
          <button
            onClick={() => setShowLogoutPopup(false)}
            className="absolute right-3 top-2 text-white text-xl"
          >
            ✖
          </button>
        </div>
      )}

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
          }
          to {
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-in-out; /* Reduced animation duration */
        }
      `}</style>
    </div>
  );
};

export default Navbar;




