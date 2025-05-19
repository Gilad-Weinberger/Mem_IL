import React from "react";
import { useFormContext } from "../FormContext";
import { LocationConnectionInput } from "@/components/SoldierForm/FormComponents";

const LocationConnectionStep = () => {
  const { formData, updateFormData, errors } = useFormContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="mb-6">
      <LocationConnectionInput
        value={formData.locationConnection || ""}
        onChange={handleChange}
        error={errors.locationConnection}
      />
    </div>
  );
};

export default LocationConnectionStep;
