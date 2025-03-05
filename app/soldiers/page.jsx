"use client";

import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { getAllObjects } from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

const Page = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(soldiers, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: true,
    });
  }, [soldiers]);

  // Get filtered soldiers based on search
  const filteredSoldiers = useMemo(() => {
    if (!searchQuery) return soldiers;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [fuse, searchQuery, soldiers]);

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
        <div className="relative flex justify-center w-full">
          <input
            type="text"
            dir="rtl"
            placeholder="חפש חייל/ת..."
            className="w-full md:w-3/4 lg:w-1/2 rounded-lg py-2 pr-4 pl-10 md:pl-12 text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Image
            src="/search.svg"
            alt="search"
            width={22}
            height={22}
            className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2"
          />
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
                    {soldier.darga} {soldier.name}
                  </p>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
