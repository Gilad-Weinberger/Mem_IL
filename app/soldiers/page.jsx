"use client";

import { useState, useEffect } from "react";
import { getAllObjects } from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  const [soldiers, setSoldiers] = useState([]);

  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        const data = await getAllObjects("soldiers");
        setSoldiers(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching soldiers:", error);
      }
    };

    fetchSoldiers();
  }, []);

  return (
    <div className="bg-black w-full pt-14 p-5 min-h-screen h-full text-white">
      <Navbar />
      <div className="h-full" dir="rtl">
        <div className="flex items-center justify-center w-full" dir="rtl">
          <input
            type="text"
            dir="rtl"
            placeholder="חפש חייל/ת..."
            className="w-full rounded-lg py-1 pr-3 pl-8 text-black float-right"
          />
          <Image
            src="/search.svg"
            alt="search"
            width={22}
            height={22}
            className="-mr-7"
          />
        </div>
        <div className="text-center w-full" dir="rtl">
          <p className="text-[30px] mt-4">ארכיון החיילים</p>
          <hr className="w-full mt-2" />
          <div className="grid grid-cols-2 gap-3 mt-2 w-full">
            {soldiers.length > 0 ? (
              soldiers.map((soldier) => (
                <Link
                  key={soldier.id}
                  href={`/soldiers/${soldier.id}`}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80"
                >
                  <Image
                    src={soldier.images[0] || "/nevo.jpeg"}
                    alt="soldier-image"
                    width={100}
                    height={100}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                  <p className="mt-2 leading-none text-[20px]">
                    {soldier.name}
                  </p>
                </Link>
              ))
            ) : (
              <p>Loading soldiers...</p>
            )}
          </div>
          <p className="mt-8 text-center">
            ליצירת קשר והוספת חייל/ת לאתר memory.il.app@gmail.com
          </p>
          <p className="text-center text-[14px] mt-6">
            האתר פותח ע"י גלעד וינברגר, עמיחי בן יוסף ואפרים דויטש
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
