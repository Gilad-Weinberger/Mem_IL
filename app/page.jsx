"use client";

// import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const imageList = [
    "/nevo.jpeg",
    "/nevo.jpeg",
    "/nevo.jpeg",
    "/nevo.jpeg",
    "/nevo.jpeg",
    "/nevo.jpeg",
  ];

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     window.location.reload();
  //   }, 1700);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div
      className="bg-black w-screen min-h-screen h-full py-5 px-10 text-white float-right"
      dir="rtl"
    >
      <div className="flex items-center justify-center w-full" dir="rtl">
        <input
          type="text"
          dir="rtl"
          className="w-full rounded-lg py-1 px-2 pl-8 text-black float-right"
        />
        <Image
          src={"/search.svg"}
          alt="search"
          width={22}
          height={22}
          className="-mr-7"
        />
      </div>
      <p className="text-[50px] text-center font-extralight max-w-full">
        סמ"ר נבו פישר
      </p>
      <Image
        src="/nevo.jpeg"
        alt="soldier"
        width={500}
        height={550}
        className="w-full h-auto object-cover rounded-lg mt-4"
      />
      <p className="mt-6 text-[30px]">סיפור חייו</p>
      <hr className="w-[50%] mt-0.5" />
      <p className="mt-1.5">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem doloremque
        officiis facilis voluptas iste hic tenetur animi itaque. Dicta explicabo
        deleniti quae inventore! Odit corrupti, distinctio molestias dolor sequi
        officiis!
      </p>
      <p className="mt-6 text-[30px]">תמונות</p>
      <hr className="w-[50%] mt-0.5" />
      <div className="flex flex-wrap justify-between gap-4 mt-3">
        {imageList.map((image, index) => (
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
      <form>
        <p className="mt-8 text-[30px]">יש לכם משהו להוסיף?</p>
        <hr className="w-[90%] mt-0.5" />
        <input
          type="text"
          placeholder="שם החייל"
          className="w-full rounded-lg mt-2 text-black"
        />
        <textarea
          name="message"
          className="w-full mt-3 rounded-lg h-[100px] text-black"
          placeholder="תכתוב כאן"
        ></textarea>
      </form>
    </div>
  );
}
