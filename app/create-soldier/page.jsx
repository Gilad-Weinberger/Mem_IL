"use client";

import { useState } from "react";
import { createObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";

const Page = () => {
  const [soldier, setSoldier] = useState({});
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSoldier((prevSoldier) => ({
      ...prevSoldier,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileLinks = files.map((file) => URL.createObjectURL(file));
    setSoldier((prevSoldier) => ({
      ...prevSoldier,
      images: prevSoldier.images ? [...prevSoldier.images, ...fileLinks] : fileLinks,
    }));
  };

  const handleImageDelete = (index) => {
    setSoldier((prevSoldier) => {
      const newImages = prevSoldier.images.filter((_, i) => i !== index);
      return {
        ...prevSoldier,
        images: newImages,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!soldier.name) newErrors.name = "שם מלא נדרש";
    if (!soldier.darga) newErrors.darga = "דרגה נדרשת";
    if (!soldier.lifeStory) newErrors.lifeStory = "סיפור חיים נדרש";
    if (!soldier.birthDate) newErrors.birthDate = "תאריך לידה נדרש";
    if (!soldier.dateOfDeath) newErrors.dateOfDeath = "תאריך פטירה נדרש";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createObject("soldiers", soldier)
      .then((docRef) => {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        setTimeout(() => router.push(`/soldiers/${docRef.id}`), 3500);
      })
      .catch((error) => {
        console.error("Error creating soldier:", error);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 relative">
      {/* Success Popup */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full flex justify-center animate-slideIn">
          <div className="bg-green-600 text-white w-full max-w-md py-3 px-4 rounded-b-lg flex items-center justify-between shadow-lg">
            <p className="text-lg font-semibold">נוצר בהצלחה ✅</p>
            <button onClick={() => setShowPopup(false)} className="text-white text-2xl font-bold">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-md py-10">
        <h2 className="text-2xl font-bold text-center text-white mb-6">הוספת חייל/ת</h2>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-300 mb-2 float-right">:שם מלא</label>
          <input
            type="text"
            id="name"
            name="name"
            value={soldier.name || ""}
            onChange={handleChange}
            placeholder="הכנס שם"
            className="w-full p-3 rounded bg-gray-700 text-white text-right"
          />
          {errors.name && <p className="text-red-500 text-right">{errors.name}</p>}
        </div>

        {/* Rank */}
        <div className="mb-4">
          <label htmlFor="darga" className="block text-gray-300 mb-2 float-right">:דרגה</label>
          <input
            type="text"
            id="darga"
            name="darga"
            value={soldier.darga || ""}
            onChange={handleChange}
            placeholder="הכנס דרגה"
            className="w-full p-3 rounded bg-gray-700 text-white text-right"
          />
          {errors.darga && <p className="text-red-500 text-right">{errors.darga}</p>}
        </div>

        {/* Life Story */}
        <div className="mb-4">
          <label htmlFor="lifeStory" className="block text-gray-300 mb-2 float-right">:סיפור חיים</label>
          <textarea
            id="lifeStory"
            name="lifeStory"
            value={soldier.lifeStory || ""}
            onChange={handleChange}
            placeholder="הכנס סיפור חיים"
            className="w-full p-3 rounded bg-gray-700 text-white text-right"
          />
          {errors.lifeStory && <p className="text-red-500 text-right">{errors.lifeStory}</p>}
        </div>

        {/* Birth Date */}
        <div className="mb-4">
          <label htmlFor="birthDate" className="block text-gray-300 mb-2 float-right">:תאריך לידה</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={soldier.birthDate || ""}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white text-right"
          />
        </div>

        {/* Date of Death */}
        <div className="mb-4">
          <label htmlFor="dateOfDeath" className="block text-gray-300 mb-2 float-right">:תאריך פטירה</label>
          <input
            type="date"
            id="dateOfDeath"
            name="dateOfDeath"
            value={soldier.dateOfDeath || ""}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white text-right"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label htmlFor="images" className="block text-gray-300 mb-2 float-right">:תמונות</label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Image Preview */}
        {soldier.images && (
          <div className="flex flex-wrap mb-4">
            {soldier.images.map((image, index) => (
              <div key={index} className="relative m-2">
                <img src={image} alt={`uploaded ${index}`} className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full py-0.5 px-1.5 text-[15px]"
                >
                  &#x1F5D1;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="w-full p-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200">
          שלח
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center max-w-[70%] text-white">ליצירת קשר <br />memory.il.app@gmail.com</p>
      <p className="text-center text-[14px] mt-3 text-white">
        האתר פותח ע"י גלעד וינברגר, עמיחי בן יוסף ואפרים דויטש
      </p>
    </div>
  );
};

export default Page;

