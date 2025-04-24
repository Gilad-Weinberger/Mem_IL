import React from "react";
import { useFormContext } from "../FormContext";
import FormInput from "@/components/SoldierForm/FormComponents/FormInput";
import RankDropdown from "@/components/SoldierForm/FormComponents/RankDropdown";

const BasicInfoStep = () => {
  const { formData, updateFormData, errors } = useFormContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="mb-6">
      <FormInput
        id="name"
        name="name"
        value={formData.name || ""}
        onChange={handleChange}
        placeholder="הכנס שם"
        label="שם מלא"
        error={errors.name}
      />

      <RankDropdown
        value={formData.rank || ""}
        onChange={handleChange}
        error={errors.rank}
      />
    </div>
  );
};

export default BasicInfoStep;
