"use client";

import { useState, useEffect } from "react";
import { getAllObjects, updateObject } from "@/lib/functions/dbFunctions";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserStatus(userData?.status || null);
          }
        } catch (err) {
          console.error("Error fetching user document:", err);
          setError("Failed to fetch user data.");
        }
      } else {
        setUser(null);
        router.push("/signin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && userStatus === "admin") {
      setUsersLoading(true);
      const unsubscribe = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const usersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersData);
          setUsersLoading(false);
        },
        (error) => {
          console.error("Error fetching users:", error);
          setUsersError("Failed to load users.");
          setUsersLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, userStatus]);

  const changeUserStatus = async (userId, newStatus) => {
    const selectedUser = users.find((user) => user.id === userId);
    if (selectedUser?.status === newStatus) return;

    const confirmChange = window.confirm(
      `Are you sure you want to change this user:\nemail: ${selectedUser.email}\nstatus to "${newStatus}"?`
    );

    if (!confirmChange) return;

    try {
      await updateObject("users", userId, { status: newStatus });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">אין לך הרשאה לגשת לעמוד זה</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">צריך להתחבר על מנת לגשת לעמוד זה</p>
      </div>
    );
  }

  return (
    <div
      className="bg-black w-full pt-14 p-5 min-h-screen h-full text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="h-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
          <div className="relative flex w-full md:w-1/2">
            <input
              type="text"
              dir="rtl"
              placeholder="חפש חייל/ת..."
              className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Image
              src="/search.svg"
              alt="search"
              width={22}
              height={22}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
          </div>
        </div>
        <div className="text-center w-full mt-6">
          <p className="text-2xl md:text-3xl font-semibold">רשימת משתמשים</p>
          <hr className="w-full mt-2 border-gray-500" />
        </div>
        {usersLoading ? (
          <div className="text-white text-center mt-20">טוען משתמשים...</div>
        ) : usersError ? (
          <div className="text-white text-center mt-20">
            שגיאה בטעינת המשתמשים: {usersError}
          </div>
        ) : (
          <div className="gap-3 mt-5">
            {users.map((user) => (
              <div
                key={user.id}
                className="w-full border border-white bg-indigo-500 h-[100px] p-3 rounded-lg relative mt-5"
              >
                <p>{user.email}</p>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button
                    className={`bg-white text-black p-2 rounded-full relative`}
                    onClick={() => changeUserStatus(user.id, "regular")}
                  >
                    <Image
                      src="/regular.svg"
                      alt="Regular"
                      width={25}
                      height={25}
                    />
                    {user.status === "regular" && (
                      <span className="absolute -top-0.5 -right-0.5 bg-black w-3.5 h-3.5 rounded-full"></span>
                    )}
                  </button>
                  <button
                    className={`bg-white text-black p-2 rounded-full relative`}
                    onClick={() => changeUserStatus(user.id, "family")}
                  >
                    <Image
                      src="/family.svg"
                      alt="Family"
                      width={25}
                      height={25}
                    />
                    {user.status === "family" && (
                      <span className="absolute -top-0.5 -right-0.5 bg-black w-3.5 h-3.5 rounded-full"></span>
                    )}
                  </button>
                  <button
                    className={`bg-white text-black p-2 rounded-full relative`}
                    onClick={() => changeUserStatus(user.id, "developer")}
                  >
                    <Image
                      src="/developer.svg"
                      alt="Developer"
                      width={25}
                      height={25}
                    />
                    {user.status === "developer" && (
                      <span className="absolute -top-0.5 -right-0.5 bg-black w-3.5 h-3.5 rounded-full"></span>
                    )}
                  </button>
                  <button
                    className={`bg-white text-black p-2 rounded-full relative`}
                    onClick={() => changeUserStatus(user.id, "admin")}
                  >
                    <Image
                      src="/admin.svg"
                      alt="Admin"
                      width={25}
                      height={25}
                    />
                    {user.status === "admin" && (
                      <span className="absolute -top-0.5 -right-0.5 bg-black w-3.5 h-3.5 rounded-full"></span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Page;
