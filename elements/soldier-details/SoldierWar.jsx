import React from "react";
import Image from "next/image";
import Link from "next/link";
import MapDisplay from "./MapDisplay";

const SoldierWar = ({ warFellIn, tombLocation }) => {
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

      {tombLocation && <MapDisplay locationUrl={tombLocation} />}
    </div>
  );
};

export default SoldierWar;
