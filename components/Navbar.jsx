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
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
      console.log("user", user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <div
        className="fixed top-0 right-0 w-full bg-black flex items-center justify-between px-10 h-12 z-50 shadow-md"
        dir="rtl"
      >
        <div className="flex items-center gap-5" dir="rtl">
          <Link href="/soldiers">
            <Image
              src={"/home.svg"}
              alt="home-icon"
              height={25}
              width={25}
              className="invert"
            />
          </Link>
          {user ? (
            <Link href="/notifications">
              <Image
                src={"/bell.svg"}
                alt="notifications-icon"
                height={23}
                width={23}
                className="invert"
              />
            </Link>
          ) : null}
        </div>
        {user ? (
          <button onClick={logout} className="text-white hover:text-red-500">
            התנתק
          </button>
        ) : (
          <Link href="/signin" className="text-white hover:text-gray-300 ">
            התחבר
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
