import React from "react";
import { useFormContext } from "../FormContext";
import FormTextarea from "@/elements/SoldierForm/FormComponents/FormTextarea";

const LifeStoryStep = () => {
  const { formData, updateFormData, errors } = useFormContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="mb-6">
      <FormTextarea
        id="lifeStory"
        name="lifeStory"
        value={formData.lifeStory || ""}
        onChange={handleChange}
        placeholder="הכנס סיפור חיים"
        label="סיפור חיים"
        error={errors.lifeStory}
      />
    </div>
  );
};

export default LifeStoryStep;
