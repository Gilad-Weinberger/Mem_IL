"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { rankToInitials } from "@/lib/functions/rankInitials";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

const SoldierHeader = ({ soldier, id, handleQRClick }) => {
  const { user } = useAuth();
  const [hebrewBirthDate, setHebrewBirthDate] = useState("");
  const [hebrewDeathDate, setHebrewDeathDate] = useState("");

  // Extract image URL for the first image
  const getMainImageUrl = () => {
    if (!soldier.images || soldier.images.length === 0) {
      return null; // Return null instead of empty string for no image
    }

    const firstImage = soldier.images[0];
    // Handle both string format and object format for images
    return typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || null;
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString || dateString.trim().length === 0) return "";

    try {
      const [year, month, day] = dateString.split(/[-/]/);
      if (year && month && day) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }

      // If the date is already in dd/mm/yyyy format or cannot be parsed
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format dates for display
  const formatDateRange = (birthDate, deathDate) => {
    const hasBirth = birthDate && birthDate.trim().length > 0;
    const hasDeath = deathDate && deathDate.trim().length > 0;

    if (hasBirth && hasDeath) {
      return `${formatDate(deathDate)} - ${formatDate(birthDate)}`;
    } else if (hasBirth) {
      return ` - ${formatDate(birthDate)}`;
    } else if (hasDeath) {
      return `${formatDate(deathDate)} - `;
    }
    return "";
  };

  useEffect(() => {
    const convertDateToHebrew = (dateString) => {
      const date = new Date(dateString);
      const jewishDate = toJewishDate(date);
      const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate);
      return jewishDateInHebrewStr;
    };

    if (soldier.birthDate) {
      setHebrewBirthDate(convertDateToHebrew(soldier.birthDate));
    }
    if (soldier.dateOfDeath) {
      setHebrewDeathDate(convertDateToHebrew(soldier.dateOfDeath));
    }
  }, [soldier.birthDate, soldier.dateOfDeath]);

  return (
    <div className="max-w-3xl mx-auto text-center mt-6">
      <p className="text-[40px] mt-1 leading-[40px] font-extralight">
        {rankToInitials(soldier.rank)} {soldier.name} הי"ד
      </p>

      {/* Only render the Image component if we have a valid image source */}
      {getMainImageUrl() ? (
        <Image
          src={getMainImageUrl()}
          alt="soldier"
          width={300}
          height={330}
          priority={true}
          className="w-full sm:w-[60%] md:w-[55%] h-auto object-cover rounded-lg mx-auto mt-3"
        />
      ) : (
        <div className="w-full sm:w-[60%] md:w-[55%] h-[330px] bg-gray-700 rounded-lg mx-auto mt-3 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      )}

      {/* Birth date, death date, and war information */}
      <div className="mt-4 mb-4">
        <p className="text-lg font-light">
          {formatDateRange(soldier.birthDate, soldier.dateOfDeath)}
        </p>
        {hebrewBirthDate && hebrewDeathDate ? (
          <p className="text-md font-light mt-0.5">
            {formatDateRange(hebrewDeathDate, hebrewBirthDate)}
          </p>
        ) : null}
        {soldier.warFellIn && (
          <p className="text-md font-light mt-3 ">נפל ב{soldier.warFellIn}</p>
        )}
      </div>

      <div className="flex flex-wrap item-center justify-center mt-5 gap-6">
        <button
          onClick={handleQRClick}
          className="bg-[rgb(25,25,25)] rounded-lg h-[42px] w-[42px] flex items-center justify-center"
        >
          <Image
            src="/qr.svg"
            alt="qr-icon"
            width={40}
            height={40}
            className=""
          />
        </button>
        {user && user.uid === soldier.createdBy && (
          <Link
            href={`/edit-soldier/${id}`}
            className="inline-block px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
          >
            ערוך חייל
          </Link>
        )}
      </div>
    </div>
  );
};

export default SoldierHeader;
