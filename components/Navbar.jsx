"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logout from "@/lib/functions/logout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllObjects } from "@/lib/functions/dbFunctions";

const Navbar = () => {
  const [user, setUser] = useState();
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(storedUser);
        fetchNotificationCount(JSON.parse(storedUser).uid);
      } else {
        setUser(null);
        setNotificationCount(0);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchNotificationCount = async (userId) => {
    try {
      const soldiers = await getAllObjects("soldiers");
      const userSoldiers = soldiers.filter(
        (soldier) => soldier.createdBy === userId
      );

      const allComments = await getAllObjects("comments");
      const pendingComments = allComments.filter(
        (comment) =>
          comment.status === "pending" &&
          userSoldiers.some((soldier) => soldier.id === comment.soldierId)
      );

      setNotificationCount(pendingComments.length);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

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
          {user && (
            <>
              <Link href="/notifications" className="relative">
                <Image
                  src={"/bell.svg"}
                  alt="notifications-icon"
                  height={23}
                  width={23}
                  className="invert"
                />
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <Link href="/add-soldier">
                <Image
                  src={"/plus.svg"}
                  alt="add-soldier-icon"
                  height={25}
                  width={25}
                  className="invert"
                />+
              </Link>
            </>
          )}
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
