import React from "react";
import FormInput from "./FormInput";

const SocialMediaInputs = ({ soldier, onChange }) => {
  return (
    <>
      <FormInput
        id="instagram_link"
        name="instagram_link"
        value={soldier.instagram_link}
        onChange={onChange}
        placeholder="הכנס קישור לאינסטגרם"
        label="קישור לעמוד אינסטגרם"
        type="url"
      />

      <FormInput
        id="facebook_link"
        name="facebook_link"
        value={soldier.facebook_link}
        onChange={onChange}
        placeholder="הכנס קישור לפייסבוק"
        label="קישור לדף פייסבוק"
        type="url"
      />

      <FormInput
        id="whatsapp_link"
        name="whatsapp_link"
        value={soldier.whatsapp_link}
        onChange={onChange}
        placeholder="הכנס קישור לקבוצת וואטסאפ"
        label="קישור לקבוצת וואטסאפ"
        type="url"
      />
    </>
  );
};

export default SocialMediaInputs;
