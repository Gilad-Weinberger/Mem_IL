"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getObject } from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    return (
      <div className="text-white text-center text-xl mt-10">
        שגיאה בטעינת המידע
      </div>
    );
  }

  const handleCommentChange = () => {
    console.log("hello");
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="bg-black w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <Navbar />

      {/* Search Bar */}
      <div className="flex items-center justify-center w-full mt-2 max-w-2xl mx-auto">
        <input
          type="text"
          dir="rtl"
          placeholder="חפש חייל/ת..."
          className="w-full rounded-lg py-2 pr-3 pl-10 text-black text-lg"
        />
        <Image
          src={"/search.svg"}
          alt="search"
          width={22}
          height={22}
          className="-mr-8"
        />
      </div>

      {/* Soldier Info */}
      <div className="max-w-3xl mx-auto text-center mt-6">
        <p className="text-[40px] leading-[40px] font-extralight">
          {soldier.darga} {soldier.name}
        </p>
        <Image
          src={soldier?.images?.[0] || "/fallback.png"}
          alt="soldier"
          width={500}
          height={550}
          className="w-full h-auto object-cover rounded-lg mt-4"
        />
      </div>

      {/* Life Story */}
      <div className="max-w-3xl mx-auto mt-6">
        <p className="text-[30px]">סיפור חיים</p>
        <hr className="w-[50%] mt-1" />
        <p className="mt-2 text-lg">{soldier.lifeStory}</p>
      </div>

      {/* Images Section */}
      <div className="max-w-3xl mx-auto mt-6">
        <p className="text-[30px]">תמונות</p>
        <hr className="w-[50%] mt-1" />
        <div className="flex flex-wrap justify-between gap-4 mt-3">
          {(soldier.images || []).map((image, index) => (
            <div key={index} className="w-[47%]">
              <Image
                src={image}
                alt="image"
                width={1000}
                height={1000}
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Comments Form - Updated for Consistency */}
      <div className="max-w-3xl mx-auto mt-8">
        <form
          onSubmit={handleCommentSubmit}
          onChange={handleCommentChange}
          className="w-full bg-black p-6 rounded-lg shadow-lg"
        >
          <p className="text-[22px]">יש לכם משהו להוסיף?</p>
          <hr className="w-[90%] mt-1 mb-4" />
          <input
            type="text"
            placeholder="שם הכותב/ת"
            className="w-full rounded-lg mt-3 text-black pr-2 py-2 text-lg"
          />
          <textarea
            name="message"
            className="w-full mt-3 rounded-lg h-[120px] text-black pr-2 py-2 text-lg"
            placeholder="תכתבו כאן..."
          ></textarea>
          <button
            type="submit"
            className="w-full mt-2 rounded-lg hover:text-black hover:bg-white border border-white py-2 text-lg transition-all duration-200"
          >
            שלח
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
