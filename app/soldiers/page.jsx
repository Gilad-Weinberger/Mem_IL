"use client";

import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { getAllObjects } from "@/lib/functions/dbFunctions";
import { ranks } from "@/lib/data/ranks";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

const Page = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(soldiers, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: true,
    });
  }, [soldiers]);

  // Get filtered soldiers based on search and rank
  const filteredSoldiers = useMemo(() => {
    let result = soldiers;

    if (rankSearch) {
      result = result.filter((soldier) =>
        soldier.rank.toLowerCase().includes(rankSearch.toLowerCase())
      );
    }

    if (searchQuery) {
      return fuse
        .search(searchQuery)
        .map((result) => result.item)
        .filter(
          (soldier) =>
            !rankSearch ||
            soldier.rank.toLowerCase().includes(rankSearch.toLowerCase())
        );
    }

    return result;
  }, [fuse, searchQuery, soldiers, rankSearch]);

  // Filter ranks based on search
  const filteredRanks = useMemo(() => {
    if (!rankSearch) return ranks;
    return ranks.filter((rank) =>
      rank.toLowerCase().includes(rankSearch.toLowerCase())
    );
  }, [rankSearch]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".rank-dropdown")) {
        setShowRankOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        const data = await getAllObjects("soldiers");
        setSoldiers(data);
      } catch (error) {
        console.error("Error fetching soldiers:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldiers();
  }, []);

  return (
    <div className="bg-black w-full pt-14 p-5 min-h-screen h-full text-white">
      <Navbar />
      <div className="h-full max-w-4xl mx-auto" dir="rtl">
        {/* Search and Rank Filter Container */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="relative flex w-full md:w-1/2 rank-dropdown">
              <input
                type="text"
                dir="rtl"
                placeholder="חפש לפי דרגה..."
                className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
                value={rankSearch}
                onChange={(e) => setRankSearch(e.target.value)}
                onFocus={() => setShowRankOptions(true)}
              />
              <Image
                src="/search.svg"
                alt="search"
                width={22}
                height={22}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              {showRankOptions && filteredRanks.length > 0 && (
                <div className="absolute z-50 w-full mt-1 top-full right-0 bg-white rounded-lg max-h-60 overflow-y-auto">
                  {filteredRanks.map((rank) => (
                    <div
                      key={rank}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-black text-right"
                      onClick={() => {
                        setRankSearch(rank);
                        setShowRankOptions(false);
                      }}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {loading ? (
              <p className="text-center w-full text-lg">טוען חיילים...</p>
            ) : error ? (
              <p className="text-center w-full text-lg text-red-500">
                הייתה שגיאה בטעינת החיילים
              </p>
            ) : filteredSoldiers.length === 0 ? (
              <p className="text-center w-full text-lg">לא נמצאו חיילים</p>
            ) : (
              <>
                {filteredSoldiers.map((soldier) => (
                  <Link
                    key={soldier.id}
                    href={`/soldiers/${soldier.id}`}
                    className="flex flex-col items-center cursor-pointer hover:opacity-80"
                  >
                    <Image
                      src={soldier.images[0] || "/nevo.jpeg"}
                      alt="soldier-image"
                      width={150}
                      height={150}
                      className="rounded-lg w-full h-40 object-cover"
                    />
                    <p className="mt-2 text-white text-lg md:text-xl">
                      {soldier.rank} {soldier.name}
                    </p>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Page;
