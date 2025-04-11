import React from "react";
import Image from "next/image";
import Link from "next/link";

const SoldierWar = ({ warFellIn }) => {
  return (
    <div className="max-w-3xl mx-auto mt-6">
      <p className="text-[30px]">מידע נוסף</p>
      <hr className="w-[50%] mt-1" />

      {warFellIn && (
        <div className="mt-4">
          <p className="text-lg font-semibold">נפל במלחמה:</p>
          <p className="text-lg">{warFellIn}</p>
        </div>
      )}
    </div>
  );
};

export default SoldierWar;
