"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/shared/layout/Navbar";
import Footer from "@/components/shared/layout/Footer";
import SearchBar from "./SearchBar";
import UserList from "./UserList";
import { handleStatusChange } from "./StatusChangeUtils";
import { useAuth } from "@/context/AuthContext";
import UnauthorizedState from "@/components/shared/ui/UnauthorizedState";

const StatusChangeContainer = () => {
  const { user, userStatus, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const changeUserStatus = (userId, newStatus) => {
    handleStatusChange(userId, newStatus, users, setUsers);
  };

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus !== "admin") {
    return <UnauthorizedState message="אין לך הרשאה לגשת לעמוד זה" />;
  }

  if (!user) {
    return <UnauthorizedState message="צריך להתחבר על מנת לגשת לעמוד זה" />;
  }

  return (
    <div
      className="bg-black w-full pt-14 p-5 min-h-screen h-full text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="h-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="text-center w-full mt-6">
          <p className="text-2xl md:text-3xl font-semibold">רשימת משתמשים</p>
          <hr className="w-full mt-2 border-gray-500" />
        </div>
        <UserList
          users={filteredUsers}
          changeUserStatus={changeUserStatus}
          usersLoading={usersLoading}
          usersError={usersError}
        />
      </div>
      <Footer />
    </div>
  );
};

export default StatusChangeContainer;
