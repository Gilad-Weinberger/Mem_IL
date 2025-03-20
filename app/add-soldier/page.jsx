"use client";

import { useState, useEffect, useMemo } from "react";
import { createObject } from "@/lib/functions/dbFunctions";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Import db from firebase
import { ranks } from "@/lib/data/ranks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Import Firestore functions

const Page = () => {
  const [soldier, setSoldier] = useState({});
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState();
  const [userStatus, setUserStatus] = useState(null); // New state for user status
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      // Check user status in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserStatus(userDoc.data().status);
      }

      // Check if the user has a pending status request
      const q = query(
        collection(db, "form-requests"),
        where("uid", "==", user.uid),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setHasPendingRequest(true);
      }
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

    // Check if user status is regular
    if (userStatus === "regular" || !userStatus) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-8"
          dir="rtl"
        >
          <div className="flex flex-col items-center gap-4">
            <p className="text-xl mb-4 max-w-[80%]">
              הסטטוס שלך הוא רגיל. אנא בקש שדרוג סטטוס או חזור לעמוד הקודם.
            </p>
            <button
              onClick={() => router.back()}
              className="p-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200 w-full"
            >
              חזור לעמוד הקודם
            </button>
            <button
              onClick={() => router.push("/status-form")}
              className="p-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200 w-full"
            >
              בקש שדרוג סטטוס
            </button>
          </div>
        </div>
      );
    }

    const newErrors = {};

    if (!soldier.name) newErrors.name = "שם מלא נדרש";
    if (!soldier.rank) newErrors.rank = "דרגה נדרשת";
    if (!soldier.lifeStory) newErrors.lifeStory = "סיפור חיים נדרש";
    if (!soldier.birthDate) newErrors.birthDate = "תאריך לידה נדרש";
    if (!soldier.dateOfDeath) newErrors.dateOfDeath = "תאריך פטירה נדרש";
    if (!soldier.images || soldier.images.length === 0)
      newErrors.images = "חובה להעלות לפחות תמונה אחת";

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

  // Show message if user has a pending status request
  if (hasPendingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">בקשתך לעדכון סטטוס בטיפול כרגע</p>
      </div>
    );
  }

  // Show message if user status is regular
  if (user && (userStatus === "regular" || !userStatus)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4 text-center"
        dir="rtl"
      >
        <button
          onClick={() => router.back()}
          className="fixed top-4 left-4 p-2 rounded"
        >
          <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
        </button>
        <p className="text-xl max-w-[80%]">
          הסטטוס שלך הוא רגיל, <br /> אנא בקש עדכון סטטוס.
        </p>
        <button
          onClick={() => router.push("/status-request")}
          className="p-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200"
        >
          בקש עדכון סטטוס
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 w-full pt-14 p-5 min-h-screen h-full text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center">
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
            {errors.images && (
              <p className="text-red-500 text-right mt-1">{errors.images}</p>
            )}
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
          {/* New social media fields */}
          <div className="mb-4">
            <label
              htmlFor="instagram_link"
              className="block text-gray-300 mb-2 float-right"
            >
              :קישור לעמוד אינסטגרם
            </label>
            <input
              type="url"
              id="instagram_link"
              name="instagram_link"
              value={soldier.instagram_link || ""}
              onChange={handleChange}
              placeholder="הכנס קישור לאינסטגרם"
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="facebook_link"
              className="block text-gray-300 mb-2 float-right"
            >
              :קישור לדף פייסבוק
            </label>
            <input
              type="url"
              id="facebook_link"
              name="facebook_link"
              value={soldier.facebook_link || ""}
              onChange={handleChange}
              placeholder="הכנס קישור לפייסבוק"
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="whatsapp_link"
              className="block text-gray-300 mb-2 float-right"
            >
              :קישור לקבוצת וואטסאפ
            </label>
            <input
              type="url"
              id="whatsapp_link"
              name="whatsapp_link"
              value={soldier.whatsapp_link || ""}
              onChange={handleChange}
              placeholder="הכנס קישור לקבוצת וואטסאפ"
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
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
    </div>
  );
};

export default Page;
