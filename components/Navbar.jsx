"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logout from "@/lib/functions/logout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const [user, setUser] = useState();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/soldiers");
      }
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/soldiers");
  };

  return (
    <div>
      <div
        className="fixed top-0 right-0 w-full bg-black flex items-center justify-between px-10 h-12 z-50 shadow-md"
        dir="rtl"
      >
        <Link
          href="/soldiers"
          className="text-white hover:text-gray-300 transition-all"
        >
          <Image
            src={"/home.svg"}
            alt="home-icon"
            height={25}
            width={25}
            className="invert"
          />
          שלום {user ? user.displayName : "אורח"}
        </Link>
        {user ? (
          <button
            onClick={handleLogout}
            className="text-white hover:text-red-500 transition-all"
          >
            התנתק
          </button>
        ) : (
          <Link
            href="/signup"
            className="text-white hover:text-gray-300 transition-all"
          >
            התחבר
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
