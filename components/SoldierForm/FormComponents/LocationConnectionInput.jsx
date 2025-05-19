import React from "react";
import FormTextarea from "./FormTextarea";

const LocationConnectionInput = ({ value, onChange, error }) => {
  return (
    <FormTextarea
      id="locationConnection"
      name="locationConnection"
      value={value || ""}
      onChange={onChange}
      placeholder="הכנס מקום או מיקום שהיה משמעותי עבור החייל/ת"
      label="מקום אהוב"
      error={error}
    />
  );
};

export default LocationConnectionInput;
