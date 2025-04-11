import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { warsList } from "@/lib/data/wars";

const SoldierSearch = ({ onSearchChange, onWarChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [warSearch, setWarSearch] = useState("");
  const [showWarOptions, setShowWarOptions] = useState(false);
  const warDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        warDropdownRef.current &&
        !warDropdownRef.current.contains(event.target)
      ) {
        setShowWarOptions(false);
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

  const handleWarSelect = (war) => {
    setWarSearch(war);
    setShowWarOptions(false);
    onWarChange(war);
  };

  const handleWarChange = (e) => {
    setWarSearch(e.target.value);
    onWarChange(e.target.value);
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
        {/* War search with dropdown */}
        <div
          ref={warDropdownRef}
          className="relative flex w-full md:w-1/2 war-dropdown"
        >
          <input
            type="text"
            dir="rtl"
            placeholder="חפש לפי מלחמה..."
            className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
            value={warSearch}
            onChange={handleWarChange}
            onFocus={() => setShowWarOptions(true)}
          />
          <Image
            src="/search.svg"
            alt="search"
            width={22}
            height={22}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          {showWarOptions && (
            <div className="absolute z-50 w-full mt-1 top-full right-0 bg-white rounded-lg max-h-60 overflow-y-auto">
              {warsList
                .filter((war) =>
                  war.toLowerCase().includes(warSearch.toLowerCase())
                )
                .map((war) => (
                  <div
                    key={war}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-black text-right"
                    onClick={() => handleWarSelect(war)}
                  >
                    {war}
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
