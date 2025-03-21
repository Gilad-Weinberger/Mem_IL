"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logout from "@/lib/functions/logout";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getAllObjects } from "@/lib/functions/dbFunctions";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          sessionStorage.setItem("user", JSON.stringify(authUser));
          setUser(authUser);
          fetchNotificationCount(authUser.uid);
        }

        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists()) {
          setUserStatus(userDoc.data().status);
        }
      } else {
        sessionStorage.removeItem("user"); // Clear session storage on logout
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

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div>
      <div
        className="fixed md:right-auto md:h-screen md:w-16 top-0 right-0 w-full bg-[rgb(25,25,25)] flex md:flex-col items-center justify-between md:justify-start md:gap-10 px-10 md:py-10 md:px-0 h-12 z-50 shadow-md"
        dir="rtl"
      >
        <div
          className="flex md:flex-col items-center gap-5 md:gap-12"
          dir="rtl"
        >
          <Link href="/soldiers">
            <Image
              src={"/home.svg"}
              alt="home-icon"
              height={25}
              width={25}
              className="invert md:h-8 md:w-8"
            />
          </Link>
          {user && userStatus !== "regular" && (
            <>
              <Link href="/notifications" className="relative">
                <Image
                  src={"/bell.svg"}
                  alt="notifications-icon"
                  height={23}
                  width={23}
                  className="invert md:h-8 md:w-8"
                />
                {notificationCount > 0 && (
                  <span className="absolute md:-left-3 md:top-0 -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                  className="invert md:h-8 md:w-8"
                />
              </Link>
            </>
          )}
        </div>
        {user ? (
          <button onClick={handleLogout} className="md:mt-auto">
            <Image
              src={"/signout.svg"}
              alt="signout-icon"
              height={25}
              width={25}
              className="invert hover:opacity-70 md:h-8 md:w-8"
            />
          </button>
        ) : (
          <Link href="/signin" className="md:mt-auto">
            <Image
              src={"/signin.svg"}
              alt="signin-icon"
              height={25}
              width={25}
              className="invert hover:opacity-70 md:h-8 md:w-8"
            />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
