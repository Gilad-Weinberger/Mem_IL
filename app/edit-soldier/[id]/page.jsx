"use client";

import React, { useState, useEffect } from "react";
import { getObject, updateObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SoldierFormContainer from "@/elements/SoldierForm";
import { useAuth } from "@/context/AuthContext";

const EditSoldierPage = ({ params }) => {
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const { user, userStatus, loading } = useAuth();
  const [soldierData, setSoldierData] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Fetch soldier data
      const fetchSoldier = async () => {
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
      };

      fetchSoldier();
    }
  }, [id, user]);

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
