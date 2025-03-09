"use client";

import { useState, useEffect, useMemo } from "react";
import { createObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ranks } from "@/lib/data/ranks";

const Page = () => {
  const [soldier, setSoldier] = useState({});
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState();
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if user is not authenticated
        router.push("/signin");
        return;
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, [router]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      alert("יש להתחבר כדי להוסיף חייל");
      router.push("/login");
      return;
    }

    const newErrors = {};

    if (!soldier.name) newErrors.name = "שם מלא נדרש";
    if (!soldier.rank) newErrors.rank = "דרגה נדרשת";
    if (!soldier.lifeStory) newErrors.lifeStory = "סיפור חיים נדרש";
    if (!soldier.birthDate) newErrors.birthDate = "תאריך לידה נדרש";
    if (!soldier.dateOfDeath) newErrors.dateOfDeath = "תאריך פטירה נדרש";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add the user ID to the soldier object
    const soldierWithUser = {
      ...soldier,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    };

    console.log(soldierWithUser);

    createObject("soldiers", soldierWithUser)
      .then((docRef) => {
        console.log("Soldier created successfully");
        router.push(`/soldiers/${docRef.id}`);
      })
      .catch((error) => {
        console.error("Error creating soldier:", error);
        alert("אירעה שגיאה בעת יצירת החייל");
      });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileLinks = files.map((file) => URL.createObjectURL(file));
    setSoldier((prevSoldier) => ({
      ...prevSoldier,
      images: prevSoldier.images
        ? [...prevSoldier.images, ...fileLinks]
        : fileLinks,
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

  // Filter ranks based on search
  const filteredRanks = useMemo(() => {
    if (!rankSearch) return ranks;
    return ranks.filter((rank) =>
      rank.toLowerCase().includes(rankSearch.toLowerCase())
    );
  }, [rankSearch]);

  // Add click outside handler for rank dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".rank-dropdown")) {
        setShowRankOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-md py-10"
      >
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          הוספת חייל/ת
        </h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-300 mb-2 float-right"
          >
            :שם מלא
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={soldier.name || ""}
            onChange={handleChange}
            placeholder="הכנס שם"
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
          />
          {errors.name && (
            <p className="text-red-500 text-right">{errors.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="rank"
            className="block text-gray-300 mb-2 float-right"
          >
            :דרגה
          </label>
          <div className="relative rank-dropdown">
            <input
              type="text"
              id="rank"
              name="rank"
              value={rankSearch}
              onChange={(e) => setRankSearch(e.target.value)}
              onFocus={() => setShowRankOptions(true)}
              placeholder="הכנס דרגה"
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
            {showRankOptions && filteredRanks.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                {filteredRanks.map((rank) => (
                  <div
                    key={rank}
                    className="p-2 hover:bg-gray-600 cursor-pointer text-white text-right border-b border-gray-600"
                    onClick={() => {
                      setRankSearch(rank);
                      setSoldier((prev) => ({ ...prev, rank }));
                      setShowRankOptions(false);
                      setErrors((prev) => ({ ...prev, rank: "" }));
                    }}
                  >
                    {rank}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.rank && (
            <p className="text-red-500 text-right">{errors.rank}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="lifeStory"
            className="block text-gray-300 mb-2 float-right"
          >
            :סיפור חיים
          </label>
          <textarea
            id="lifeStory"
            name="lifeStory"
            value={soldier.lifeStory || ""}
            onChange={handleChange}
            placeholder="הכנס סיפור חיים"
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
          />
          {errors.lifeStory && (
            <p className="text-red-500 text-right">{errors.lifeStory}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="images"
            className="block text-gray-300 mb-2 float-right"
          >
            :תמונות
          </label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap mb-4">
          {soldier.images &&
            soldier.images.map((image, index) => (
              <div key={index} className="relative m-2">
                <img
                  src={image}
                  alt={`uploaded ${index}`}
                  className="w-24 h-24 object-cover rounded"
                />
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
        <div className="mb-4">
          <label
            htmlFor="birthDate"
            className="block text-gray-300 mb-2 float-right"
          >
            :תאריך לידה
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={soldier.birthDate || ""}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
          />
          {errors.birthDate && (
            <p className="text-red-500 text-right">{errors.birthDate}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="dateOfDeath"
            className="block text-gray-300 mb-2 float-right"
          >
            :תאריך פטירה
          </label>
          <input
            type="date"
            id="dateOfDeath"
            name="dateOfDeath"
            value={soldier.dateOfDeath || ""}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
          />
          {errors.dateOfDeath && (
            <p className="text-red-500 text-right">{errors.dateOfDeath}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full p-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200"
        >
          שלח
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default Page;
