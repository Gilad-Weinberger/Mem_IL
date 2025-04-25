import React, { useState, useEffect, useMemo } from "react";
import { ranks } from "@/lib/data/ranks";

const RankDropdown = ({ value, onChange, error }) => {
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);

  // Filter ranks based on search
  const filteredRanks = useMemo(() => {
    if (!rankSearch) return ranks;
    return ranks.filter((rank) =>
      rank.toLowerCase().includes(rankSearch.toLowerCase())
    );
  }, [rankSearch]);

  // Add click outside handler for rank dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".rank-dropdown")) {
        setShowRankOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial rank search value if a value is provided
  useEffect(() => {
    if (value) {
      setRankSearch(value);
    }
  }, [value]);

  return (
    <div className="mb-4">
      <label htmlFor="rank" className="block text-gray-300 mb-2 float-right">
        דרגה:
      </label>
      <div className="relative rank-dropdown">
        <input
          type="text"
          id="rank"
          name="rank"
          value={rankSearch}
          onChange={(e) => setRankSearch(e.target.value)}
          onFocus={() => setShowRankOptions(true)}
          placeholder="הכנס דרגה"
          className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
        />
        {showRankOptions && filteredRanks.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
            {filteredRanks.map((rank) => (
              <div
                key={rank}
                className="p-2 hover:bg-gray-600 cursor-pointer text-white text-right border-b border-gray-600"
                onClick={() => {
                  setRankSearch(rank);
                  onChange({ target: { name: "rank", value: rank } });
                  setShowRankOptions(false);
                }}
              >
                {rank}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-right">{error}</p>}
    </div>
  );
};

export default RankDropdown;
