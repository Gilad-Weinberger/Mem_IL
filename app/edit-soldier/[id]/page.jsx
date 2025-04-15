"use client";

import React, { useState, useEffect } from "react";
import { getObject, updateObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import MultiStepFormContainer from "@/elements/SoldierForm";
import { useAuth } from "@/context/AuthContext";
import UnauthorizedState from "@/elements/shared/UnauthorizedState";

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
  }, [id, user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">טוען...</p>
      </div>
    );
  }

  if (!user) {
    return <UnauthorizedState message="צריך להתחבר על מנת לגשת לעמוד זה" />;
  }

  // Check if user status is regular
  if (userStatus === "regular" || !userStatus) {
    return <UnauthorizedState message="אין באפשרותך לערוך את פרטי החייל" />;
  }

  const handleSubmit = (updatedSoldierData) => {
    // Add updated timestamp
    const soldierWithUpdatedInfo = {
      ...updatedSoldierData,
      updatedBy: user.uid,
      updatedAt: new Date().toISOString(),
    };

    return updateObject("soldiers", id, soldierWithUpdatedInfo)
      .then(() => {
        console.log("Soldier updated successfully");
        router.push(`/soldiers/${id}`);
      })
      .catch((error) => {
        console.error("Error updating soldier:", error);
        alert("אירעה שגיאה בעת עדכון פרטי החייל");
        throw error;
      });
  };

  return (
    <MultiStepFormContainer
      initialData={soldierData}
      onSubmit={handleSubmit}
      isEdit={true}
    />
  );
};

export default EditSoldierPage;
