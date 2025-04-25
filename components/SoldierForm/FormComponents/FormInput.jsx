import React from "react";

const FormInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  type = "text",
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-300 mb-2 float-right">
        {label}:
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
      />
      {error && <p className="text-red-500 text-right">{error}</p>}
    </div>
  );
};

export default FormInput;
