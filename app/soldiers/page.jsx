"use client";

import Image from "next/image";
import getAllObjects from "@/lib/functions/dbFunctions"
import { useState, useEffect } from "react";

const page = () => {
  const colors = ["red", "green", "blue", "yellow", "purple", "orange" , "pink" , "gray" , "brown" , "lightblue"];
  const names = ["נבו פישר", "עמיחי בן יוסף", "Mike", "Anna", "Tom", "Lucy" , "John" , "Doe" , "Jane" , "Doe" , "John" , "Smith" , "Jane" , "Smith" , "John" , "Doe" , "Jane" , "Doe"];
  const links = [
    "http://localhost:3000/soldiers/56ah91geYjCeDPp84Nov",
  ];
  const [soldiers, setSoldiers] = useState([]);

  useEffect(() => {
    console.log(1 )
  })

  return (
    <div className="bg-black w-screen min-h-screen h-full text-white">
      <div className="w-full h-[80px] bg-grey flex items-center justify-center px-10 fixed top-0" dir="rtl">
        <nav className="flex space-x-4">
          <a href="" className="mx-4">דף הבית</a>
          <a href="" className="mx-4">אודות</a>
          <a href="" className="mx-4">תמונות</a>
          <a href="" className="mx-4">צור קשר</a>
        </nav>
      </div>
      <div className="h-full py-5 px-10 mt-[80px]" dir="rtl">
        <div className="flex items-center justify-center w-full" dir="rtl">
          <input
            type="text"
            dir="rtl"
            placeholder="חפש חייל/ת..."
            className="w-full rounded-lg py-1 pr-3 pl-8 text-black float-right"
          />
          <Image
            src={"/search.svg"}
            alt="search"
            width={22}
            height={22}
            className="-mr-7"
          />
        </div>
        <div className="text-center w-full" dir="rtl">
          <p className="text-[30px] mt-4">ארכיון החיילים</p>
          <hr className="w-[100%] mt-2"/>
          <div className="grid grid-cols-2 mt-2 w-full place-items-center gap-y-1">
            {colors.map((color, index) => (
              <a key={index} href={links[index]} rel="noopener noreferrer">
                <div className="flex flex-col items-center p-1 cursor-pointer hover:opacity-80">
                  <div className="h-[150px] w-[150px]" style={{ backgroundColor: color }}></div>
                  <p className="mt-2 leading-none text-[20px]">{names[index]}</p>
                </div>
              </a>
            ))}
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
}

export default page;




