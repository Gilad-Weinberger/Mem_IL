import React from "react";
import { useFormContext } from "../FormContext";
import ImageUpload from "@/components/SoldierForm/FormComponents/ImageUpload";

const ImagesStep = () => {
  const { formData, handleImageChange, handleImageDelete, errors } =
    useFormContext();

  // Use imagePreviews for new uploads, fall back to images for existing images
  const imagesToDisplay = formData.imagePreviews || formData.images || [];

  return (
    <div className="mb-6">
      <ImageUpload
        images={imagesToDisplay}
        onImageChange={handleImageChange}
        onImageDelete={handleImageDelete}
        error={errors.images}
      />
    </div>
  );
};

export default ImagesStep;
