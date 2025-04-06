import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ranks } from "@/lib/data/ranks";

const SoldierSearch = ({ onSearchChange, onRankChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);
  const rankDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        rankDropdownRef.current &&
        !rankDropdownRef.current.contains(event.target)
      ) {
        setShowRankOptions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleRankSelect = (rank) => {
    setRankSearch(rank);
    setShowRankOptions(false);
    onRankChange(rank);
  };

  const handleRankChange = (e) => {
    setRankSearch(e.target.value);
    onRankChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search inputs container */}
      <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
        {/* Name search */}
        <div className="relative flex w-full md:w-1/2">
          <input
            type="text"
            dir="rtl"
            placeholder="חפש חייל/ת..."
            className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Image
            src="/search.svg"
            alt="search"
            width={22}
            height={22}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
        {/* Rank search with dropdown */}
        <div
          ref={rankDropdownRef}
          className="relative flex w-full md:w-1/2 rank-dropdown"
        >
          <input
            type="text"
            dir="rtl"
            placeholder="חפש לפי דרגה..."
            className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
            value={rankSearch}
            onChange={handleRankChange}
            onFocus={() => setShowRankOptions(true)}
          />
          <Image
            src="/search.svg"
            alt="search"
            width={22}
            height={22}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          {showRankOptions && (
            <div className="absolute z-50 w-full mt-1 top-full right-0 bg-white rounded-lg max-h-60 overflow-y-auto">
              {ranks
                .filter((rank) =>
                  rank.toLowerCase().includes(rankSearch.toLowerCase())
                )
                .map((rank) => (
                  <div
                    key={rank}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-black text-right"
                    onClick={() => handleRankSelect(rank)}
                  >
                    {rank}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-center w-full mt-6">
        <p className="text-2xl md:text-3xl font-semibold">ארכיון החיילים</p>
        <hr className="w-full mt-2 border-gray-500" />
      </div>
    </div>
  );
};

export default SoldierSearch;
