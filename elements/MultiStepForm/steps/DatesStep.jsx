import React from "react";
import { useFormContext } from "../FormContext";
import FormInput from "@/elements/SoldierForm/FormInput";

const DatesStep = () => {
  const { formData, updateFormData, errors } = useFormContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="mb-6">
      <FormInput
        id="birthDate"
        name="birthDate"
        value={formData.birthDate || ""}
        onChange={handleChange}
        label="תאריך לידה"
        type="date"
        error={errors.birthDate}
      />

      <FormInput
        id="dateOfDeath"
        name="dateOfDeath"
        value={formData.dateOfDeath || ""}
        onChange={handleChange}
        label="תאריך פטירה"
        type="date"
        error={errors.dateOfDeath}
      />
    </div>
  );
};

export default DatesStep;
