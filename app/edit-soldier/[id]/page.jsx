"use client";

import React, { useState, useEffect } from "react";
import { getObject, updateObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import SoldierFormContainer from "@/elements/SoldierForm";

const EditSoldierPage = ({ params }) => {
  // Unwrap params with React.use()
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const [userStatus, setUserStatus] = useState(null);
  const [soldierData, setSoldierData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserStatus(userDoc.data().status);
        }

        // Fetch soldier data
        try {
          const data = await getObject("soldiers", id);
          if (data) {
            setSoldierData(data);
          } else {
            alert("החייל שאתה מנסה לערוך לא נמצא");
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching soldier:", error);
          alert("אירעה שגיאה בעת טעינת פרטי החייל");
          router.push("/");
        }
      } else {
        setUser(null);
        router.push("/signin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

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
          אין באפשרותך לערוך את פרטי החייל
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

  const handleSubmit = (updatedSoldierData) => {
    // Add updated timestamp
    const soldierWithUpdatedInfo = {
      ...updatedSoldierData,
      updatedBy: user.uid,
      updatedAt: new Date().toISOString(),
    };

    updateObject("soldiers", id, soldierWithUpdatedInfo)
      .then(() => {
        console.log("Soldier updated successfully");
        router.push(`/soldiers/${id}`);
      })
      .catch((error) => {
        console.error("Error updating soldier:", error);
        alert("אירעה שגיאה בעת עדכון פרטי החייל");
      });
  };

  return (
    <SoldierFormContainer
      initialData={soldierData}
      onSubmit={handleSubmit}
      isEdit={true}
    />
  );
};

export default EditSoldierPage;
