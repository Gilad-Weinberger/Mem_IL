import React from "react";
import { warsList } from "@/lib/data/wars";

const WarDropdown = ({ value, onChange, error }) => {
  return (
    <div className="mb-4">
      <label className="block text-white mb-2" htmlFor="warFellIn">
        נפל במלחמה-:
      </label>
      <div className="relative">
        <select
          id="warFellIn"
          name="warFellIn"
          value={value || ""}
          onChange={onChange}
          className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">בחר מלחמה</option>
          {warsList.map((war) => (
            <option key={war} value={war}>
              {war}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default WarDropdown;
