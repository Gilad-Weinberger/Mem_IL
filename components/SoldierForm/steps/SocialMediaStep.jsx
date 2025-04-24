import React from "react";
import { useFormContext } from "../FormContext";
import FormInput from "@/components/SoldierForm/FormComponents/FormInput";

const SocialMediaStep = () => {
  const { formData, updateFormData, errors } = useFormContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="mb-6">
      <FormInput
        id="instagram_link"
        name="instagram_link"
        value={formData.instagram_link || ""}
        onChange={handleChange}
        placeholder="הכנס קישור לאינסטגרם"
        label="קישור לעמוד אינסטגרם"
        type="url"
      />

      <FormInput
        id="facebook_link"
        name="facebook_link"
        value={formData.facebook_link || ""}
        onChange={handleChange}
        placeholder="הכנס קישור לפייסבוק"
        label="קישור לדף פייסבוק"
        type="url"
      />

      <FormInput
        id="whatsapp_link"
        name="whatsapp_link"
        value={formData.whatsapp_link || ""}
        onChange={handleChange}
        placeholder="הכנס קישור לקבוצת וואטסאפ"
        label="קישור לקבוצת וואטסאפ"
        type="url"
      />
    </div>
  );
};

export default SocialMediaStep;
