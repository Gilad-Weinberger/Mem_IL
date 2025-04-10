"use client";

import { createObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SoldierFormContainer from "@/elements/SoldierForm";
import { useAuth } from "@/context/AuthContext";

const Page = () => {
  const { user, userStatus, loading } = useAuth();
  const router = useRouter();

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
