import React from "react";

const MemorialTitleDropdown = ({ value, onChange, error }) => (
  <div className="mb-4">
    <label
      htmlFor="memorialTitle"
      className="block text-gray-300 mb-2 float-right"
    >
      תואר זיכרון:
    </label>
    <select
      id="memorialTitle"
      name="memorialTitle"
      value={value || "היד"}
      onChange={onChange}
      className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
    >
      <option value="היד">היד</option>
      <option value="זל">זל</option>
    </select>
    {error && <p className="text-red-500 text-right">{error}</p>}
  </div>
);

export default MemorialTitleDropdown;
