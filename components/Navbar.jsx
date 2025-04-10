"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, userStatus, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (user && userStatus !== "regular") {
      const soldiersQuery = query(
        collection(db, "soldiers"),
        where("createdBy", "==", user.uid)
      );

      const unsubscribeSoldiers = onSnapshot(soldiersQuery, (snapshot) => {
        const soldierIds = snapshot.docs.map((doc) => doc.id);

        if (soldierIds.length > 0) {
          const commentsQuery = query(
            collection(db, "comments"),
            where("status", "==", "pending"),
            where("soldierId", "in", soldierIds)
          );

          const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
            setNotificationCount(snapshot.size);
          });

          return () => unsubscribeComments();
        }
      });

      return () => unsubscribeSoldiers();
    }
  }, [user, userStatus]);

  return (
    <div>
      <div
        className="fixed md:right-auto md:h-screen md:w-16 top-0 right-0 w-full bg-[rgb(25,25,25)] flex md:flex-col items-center justify-between md:justify-start md:gap-10 px-5 md:px-0 py-8 md:py-10 h-8 z-50 shadow-md"
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
          {user && userStatus === "admin" && (
            <>
              <Link href="/admin">
                <Image
                  src={"/admin.svg"}
                  alt="admin-icon"
                  height={25}
                  width={25}
                  className="invert md:h-8 md:w-8"
                />
              </Link>
              <Link href="/status-change">
                <Image
                  src={"/status.svg"}
                  alt="status-icon"
                  height={35}
                  width={35}
                  className="invert md:h-10 md:w-10"
                />
              </Link>
            </>
          )}
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
                  <span className="absolute md:-left-3 md:-top-2 -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
          <button onClick={logout} className="md:mt-auto">
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
              src={"/user.svg"}
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
