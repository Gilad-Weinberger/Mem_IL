import React, { useState, useEffect } from "react";
import { warsList } from "@/lib/data/wars";

const WarDropdown = ({ value, onChange, error }) => {
  // If value is not in warsList and not empty, treat as custom
  const isCustom = value && !warsList.includes(value);
  const [customWar, setCustomWar] = useState(isCustom ? value : "");
  const [isOther, setIsOther] = useState(false);

  useEffect(() => {
    // If value changes (e.g. on edit), update customWar and isOther accordingly
    if (value && !warsList.includes(value)) {
      setCustomWar(value);
      setIsOther(true);
    } else if (value === "אחר...") {
      setCustomWar("");
      setIsOther(true);
    } else {
      setCustomWar("");
      setIsOther(false);
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    if (selected === "אחר...") {
      setCustomWar("");
      setIsOther(true);
      onChange({ target: { name: "warFellIn", value: "אחר..." } });
    } else {
      setCustomWar("");
      setIsOther(false);
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
          value={isCustom || isOther ? "אחר..." : value || ""}
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
        {(isCustom || isOther) && (
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
