import React from "react";
import { useFormContext } from "../FormContext";
import ImageUpload from "@/elements/SoldierForm/ImageUpload";

const ImagesStep = () => {
  const { formData, handleImageChange, handleImageDelete, errors } =
    useFormContext();

  return (
    <div className="mb-6">
      <ImageUpload
        images={formData.images || []}
        onImageChange={handleImageChange}
        onImageDelete={handleImageDelete}
        error={errors.images}
      />
    </div>
  );
};

export default ImagesStep;
