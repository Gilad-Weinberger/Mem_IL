"use client";

import { createObject } from "@/lib/functions/dbFunctions";
import { uploadMultipleFiles } from "@/lib/functions/storageUtils";
import { useRouter } from "next/navigation";
import MultiStepFormContainer from "@/elements/SoldierForm";
import { useAuth } from "@/context/AuthContext";
import UnauthorizedState from "@/elements/shared/UnauthorizedState";

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
    return <UnauthorizedState message="צריך להתחבר על מנת לגשת לעמוד זה" />;
  }

  // Check if user status is regular
  if (userStatus === "regular" || !userStatus) {
    return <UnauthorizedState message="אין באפשרותך להוסיף חייל חדש למערכת" />;
  }

  const handleSubmit = async (soldierData, imageFiles) => {
    try {
      // Handle image uploads if there are any new images
      let imageUrls = [];

      if (imageFiles && imageFiles.length > 0) {
        // Upload all images to Firebase Storage
        const uploadResults = await uploadMultipleFiles(imageFiles);

        // Extract URLs and paths
        imageUrls = uploadResults.map((result) => ({
          url: result.url,
          path: result.path,
        }));
      }

      // Add the user ID and images to the soldier object
      const soldierWithUser = {
        ...soldierData,
        images: imageUrls,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      };

      // Remove the imagePreviews field as it's only for UI display
      delete soldierWithUser.imagePreviews;

      // Create soldier document in Firestore
      const docRef = await createObject("soldiers", soldierWithUser);
      console.log("Soldier created successfully");
      router.push(`/soldiers/${docRef.id}`);
      return docRef;
    } catch (error) {
      console.error("Error creating soldier:", error);
      alert("אירעה שגיאה בעת יצירת החייל");
      throw error;
    }
  };

  return <MultiStepFormContainer onSubmit={handleSubmit} />;
};

export default Page;
