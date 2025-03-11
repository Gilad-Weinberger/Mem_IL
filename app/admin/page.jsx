"use client";

import { useState, useEffect } from "react";
import { getAllObjects, deleteObject } from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

const Page = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (e, soldierId) => {
    e.preventDefault();
    if (window.confirm("האם אתה בטוח שברצונך למחוק חייל זה?")) {
      try {
        await deleteObject("soldiers", soldierId);
        setSoldiers(soldiers.filter((soldier) => soldier.id !== soldierId));
      } catch (error) {
        console.error("Error deleting soldier:", error);
        alert("שגיאה במחיקת החייל");
      }
    }
  };

  return (
    <div className="bg-black w-full pt-14 p-5 min-h-screen h-full text-white" >
      <Navbar />
      <div className="h-full max-w-4xl mx-auto" dir="rtl">
        <div className="relative flex justify-center w-full">
          <input
            type="text"
            dir="rtl"
            placeholder="חפש חייל/ת..."
            className="w-full md:w-3/4 lg:w-1/2 rounded-lg py-2 pr-4 pl-10 md:pl-12 text-black"
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
          ) : soldiers.length === 0 ? (
            <p className="text-center w-full text-lg">רשימת החיילים ריקה</p>
          ) : (
            <>
              {soldiers.map((soldier) => (
                <div key={soldier.id} className="relative group">
                  <Link
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
                    <p className="mt-2 text-lg md:text-xl">
                      {soldier.darga} {soldier.name}
                    </p>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, soldier.id)}
                    className="absolute bottom-[43px] left-1.5 bg-red-500 p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Image
                      src="/bin.svg"
                      alt="delete"
                      width={20}
                      height={20}
                      className="invert"
                    />
                  </button>
                </div>
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
