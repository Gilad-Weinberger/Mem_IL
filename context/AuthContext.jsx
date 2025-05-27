"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import logout from "@/lib/functions/logout";

// Create and export the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStatus = async (currentUser) => {
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const status = userDoc.data().status;
          setUserStatus(status);
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              status: status,
            })
          );
          return status;
        }
      } catch (err) {
        console.error("Error fetching user document:", err);
      }
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserStatus(user);
      } else {
        setUser(null);
        setUserStatus(null);
        sessionStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserStatus = async () => {
    if (user) {
      return await fetchUserStatus(user);
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setUserStatus(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    userStatus,
    loading,
    logout: handleLogout,
    refreshUserStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
