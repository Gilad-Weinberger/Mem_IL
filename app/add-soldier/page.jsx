"use client";

import { useState, useEffect } from "react";
import { createObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import SoldierFormContainer from "@/elements/SoldierForm";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const [userStatus, setUserStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserStatus(userDoc.data().status);
        }
      } else {
        setUser(null);
        router.push("/signin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">טוען...</p>
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

  // Check if user status is regular
  if (userStatus === "regular" || !userStatus) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-8"
        dir="rtl"
      >
        <button
          onClick={() => router.back()}
          className="fixed top-4 left-4 p-2 rounded"
        >
          <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
        </button>
        <p className="text-xl mb-4 max-w-[80%]">
          אין באפשרותך להוסיף חייל חדש למערכת
        </p>
      </div>
    );
  }

  // Show message if user status is regular
  if (user && (userStatus === "regular" || !userStatus)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4 text-center"
        dir="rtl"
      >
        <button
          onClick={() => router.back()}
          className="fixed top-4 left-4 p-2 rounded"
        >
          <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
        </button>
        <p className="text-xl max-w-[80%]">
          הסטטוס שלך הוא רגיל, <br /> אנא בקש עדכון סטטוס.
        </p>
        <button
          onClick={() => router.push("/status-request")}
          className="p-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200"
        >
          בקש עדכון סטטוס
        </button>
      </div>
    );
  }

  const handleSubmit = (soldierData) => {
    // Add the user ID to the soldier object
    const soldierWithUser = {
      ...soldierData,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    };

    createObject("soldiers", soldierWithUser)
      .then((docRef) => {
        console.log("Soldier created successfully");
        router.push(`/soldiers/${docRef.id}`);
      })
      .catch((error) => {
        console.error("Error creating soldier:", error);
        alert("אירעה שגיאה בעת יצירת החייל");
      });
  };

  return <SoldierFormContainer onSubmit={handleSubmit} />;
};

export default Page;
