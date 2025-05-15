import React, { useState } from "react";
import { warsList } from "@/lib/data/wars";

const WarDropdown = ({ value, onChange, error }) => {
  const [customWar, setCustomWar] = useState("");
  const isOther =
    value === "אחר..." ||
    (warsList.includes("אחר...") && !warsList.includes(value) && value !== "");

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    if (selected === "אחר...") {
      setCustomWar("");
      onChange({ target: { name: "warFellIn", value: "אחר..." } });
    } else {
      setCustomWar("");
      onChange({ target: { name: "warFellIn", value: selected } });
    }
  };

  const handleCustomChange = (e) => {
    setCustomWar(e.target.value);
    onChange({ target: { name: "warFellIn", value: e.target.value } });
  };

  return (
    <div className="mb-4">
      <label className="block text-white mb-2" htmlFor="warFellIn">
        נפל במלחמה:
      </label>
      <div className="relative">
        <select
          id="warFellIn"
          name="warFellIn"
          value={isOther ? "אחר..." : value || ""}
          onChange={handleSelectChange}
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
        {isOther && (
          <input
            type="text"
            className="mt-2 w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="הכנס שם מלחמה"
            value={customWar}
            onChange={handleCustomChange}
            required
          />
        )}
      </div>
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default WarDropdown;
