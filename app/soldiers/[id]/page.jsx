"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getObject } from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";

const Page = () => {
  const [soldier, setSoldier] = useState({});
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      console.log("id", id);
      getObject("soldiers", id).then((data) => {
        setSoldier(data);
      });
    }
  }, [id]);

  if (!soldier) {
    return <div>error</div>;
  }

  const handleCommentChange = () => {
    console.log("hello");
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="bg-black w-full min-h-screen h-full px-5 pt-14 text-white float-right"
      dir="rtl"
    >
      <Navbar />
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
      <p className="text-[40px] text-center leading-[40px] font-extralight max-w-full  mt-6">
        {soldier.darga} {soldier.name}
      </p>
      <Image
        src={soldier?.images?.[0] || "/fallback.png"}
        alt="soldier"
        width={500}
        height={550}
        className="w-full h-auto object-cover rounded-lg mt-4"
      />
      <p className="mt-6 text-[30px]">סיפור חיים</p>
      <hr className="w-[50%] mt-0.5" />
      <p className="mt-1.5">{soldier.lifeStory}</p>
      <p className="mt-6 text-[30px]">תמונות</p>
      <hr className="w-[50%] mt-0.5" />
      <div className="flex flex-wrap justify-between gap-4 mt-3">
        {(soldier.images || []).map((image, index) => (
          <div key={index} className="w-[47%]">
            <Image
              src={image}
              alt="image"
              width={1000}
              height={1000}
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>
      <form onSubmit={handleCommentSubmit} onChange={handleCommentChange}>
        <p className="mt-8 text-[22px]">יש לכם משהו להוסיף?</p>
        <hr className="w-[90%] mt-0.5" />
        <input
          type="text"
          placeholder="שם הכותב/ת"
          className="w-full rounded-lg mt-3 text-black pr-2"
        />
        <textarea
          name="message"
          className="w-full mt-3 rounded-lg h-[100px] text-black pr-2"
          placeholder="תכתבו כאן..."
        ></textarea>
        <button
          type="submit"
          className="w-full mt-2 rounded-lg hover:text-black hover:bg-white border border-white py-1"
        >
          שלח
        </button>
      </form>
      <p className="mt-4 text-center">
        ליצירת קשר והוספת חייל/ת לאתר memory.il.app@gmail.com
      </p>
      <p className="text-center text-[14px] mt-6">
        האתר פותח ע"י גלעד וינברגר, עמיחי בן יוסף ואפרים דויטש
      </p>
    </div>
  );
};

export default Page;
