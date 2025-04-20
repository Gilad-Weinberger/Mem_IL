"use client";

import React, { useState, useEffect } from "react";
import { getObject, updateObject } from "@/lib/functions/dbFunctions";
import { uploadMultipleFiles, deleteFile } from "@/lib/functions/storageUtils";
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

  const handleSubmit = async (updatedSoldierData, imageFiles) => {
    try {
      // Determine which original images were kept and which were deleted
      const originalImages = soldierData.images || [];
      const currentPreviews = updatedSoldierData.imagePreviews || [];

      // Find kept original images (those still in previews)
      const keptOriginalImages = [];
      const imagesToDelete = [];

      // Separate original images into kept and to-be-deleted
      for (let i = 0; i < originalImages.length; i++) {
        // If this original image is still in the previews (not deleted by user)
        if (
          currentPreviews.some(
            (preview) =>
              typeof preview === "object" &&
              preview.url === originalImages[i].url
          )
        ) {
          keptOriginalImages.push(originalImages[i]);
        } else {
          // This image was deleted by the user
          imagesToDelete.push(originalImages[i]);
        }
      }

      // Delete removed images from storage
      for (const image of imagesToDelete) {
        if (image.path) {
          await deleteFile(image.path);
          console.log(`Deleted image: ${image.path}`);
        }
      }

      // Upload new images
      let newUploadedImages = [];
      if (imageFiles && imageFiles.length > 0) {
        const uploadResults = await uploadMultipleFiles(imageFiles);
        newUploadedImages = uploadResults.map((result) => ({
          url: result.url,
          path: result.path,
        }));
      }

      // Combine kept original images with newly uploaded ones
      const updatedImages = [...keptOriginalImages, ...newUploadedImages];

      // Create the final soldier object
      const soldierWithUpdatedInfo = {
        ...updatedSoldierData,
        images: updatedImages,
        updatedBy: user.uid,
        updatedAt: new Date().toISOString(),
      };

      // Remove the imagePreviews field as it's only for UI display
      delete soldierWithUpdatedInfo.imagePreviews;

      await updateObject("soldiers", id, soldierWithUpdatedInfo);
      console.log("Soldier updated successfully");
      router.push(`/soldiers/${id}`);
    } catch (error) {
      console.error("Error updating soldier:", error);
      alert("אירעה שגיאה בעת עדכון פרטי החייל");
      throw error;
    }
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
