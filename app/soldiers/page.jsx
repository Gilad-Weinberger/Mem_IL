"use client";

import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { getAllObjects } from "@/lib/functions/dbFunctions";
import { ranks } from "@/lib/data/ranks";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/elements/Navbar";
import Footer from "@/elements/Footer";
import { rankToInitials } from "@/lib/functions/rankInitials";

const PAGE_SIZE = 12; // Load soldiers in batches of 12

const Page = () => {
  const [allSoldiers, setAllSoldiers] = useState([]); // Store all soldiers
  const [displayedSoldiers, setDisplayedSoldiers] = useState([]); // Displayed soldiers
  const [searchQuery, setSearchQuery] = useState("");
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allSoldiers, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: true,
    });
  }, [allSoldiers]);

  // Get filtered soldiers based on search and rank
  const filteredSoldiers = useMemo(() => {
    let result = allSoldiers;
    if (rankSearch) {
      result = result.filter((soldier) =>
        soldier.rank.toLowerCase().includes(rankSearch.toLowerCase())
      );
    }
    return searchQuery
      ? fuse.search(searchQuery).map((res) => res.item)
      : result;
  }, [searchQuery, allSoldiers, rankSearch]);

  // Paginate the displayed soldiers
  useEffect(() => {
    setDisplayedSoldiers(filteredSoldiers.slice(0, currentPage * PAGE_SIZE));
  }, [filteredSoldiers, currentPage]);

  // Fetch soldiers from the database
  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        const data = await getAllObjects("soldiers");
        setAllSoldiers(data);
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
    <div
      className="bg-[rgb(25,25,25)] w-full pt-14 p-5 min-h-screen text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="h-full max-w-4xl mx-auto">
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
                שגיאה בטעינה
              </p>
            ) : displayedSoldiers.length === 0 ? (
              <p className="text-center w-full text-lg">לא נמצאו חיילים</p>
            ) : (
              displayedSoldiers.map((soldier) => (
                <Link
                  key={soldier.id}
                  href={`/soldiers/${soldier.id}`}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80"
                >
                  <Image
                    src={soldier.images[0] || ""}
                    alt="soldier-image"
                    width={150}
                    height={150}
                    className="rounded-lg w-full h-40 object-cover"
                    priority
                  />
                  <p className="mt-2 text-white text-lg md:text-xl">
                    {rankToInitials(soldier.rank)} {soldier.name}
                  </p>
                </Link>
              ))
            )}
          </div>
          {/* Load More Button */}
          {displayedSoldiers.length < filteredSoldiers.length && (
            <div className="flex justify-center mt-6">
              <button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                טען עוד
              </button>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Page;
