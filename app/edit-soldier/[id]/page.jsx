"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getObject, updateObject } from "@/lib/functions/dbFunctions";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Navbar from "@/elements/Navbar";
import Footer from "@/elements/Footer";
import { ranks } from "@/lib/data/ranks";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

const EditSoldierPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [soldier, setSoldier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [rankSearch, setRankSearch] = useState("");
  const [showRankOptions, setShowRankOptions] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserStatus(userDoc.data().status);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getObject("soldiers", id)
        .then((soldierData) => {
          if (!soldierData) {
            setError(new Error("לא נמצא חייל"));
          } else {
            setSoldier(soldierData);
          }
        })
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".rank-dropdown")) {
        setShowRankOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSoldier((prevSoldier) => ({
      ...prevSoldier,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    updateObject("soldiers", id, soldier)
      .then(() => {
        alert("החייל עודכן בהצלחה");
        router.push(`/soldiers/${id}`);
      })
      .catch((err) => {
        console.error("Error updating soldier:", err);
        alert("שגיאה בעדכון החייל, נסה שוב");
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

  if (loading) {
    return (
      <div className="text-white text-center text-xl mt-10">טוען מידע...</div>
    );
  }

  if (
    userStatus === "regular" ||
    !userStatus ||
    user.uid !== soldier?.createdBy
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-8"
        dir="rtl"
      >
        <button
          onClick={() => router.back()}
          className="fixed top-4 left-4 p-2 rounded"
        >
          <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
        </button>
        <p className="text-xl mb-4 max-w-[80%]">אין באפשרותך לערוך חייל זה</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white text-center text-xl mt-10">
        שגיאה בטעינת המידע: {error.message}
      </div>
    );
  }

  if (!soldier) {
    return (
      <div className="text-white text-center text-xl mt-10">
        שגיאה בטעינת המידע
      </div>
    );
  }

  return (
    <div
      className="bg-[rgb(25,25,25)] w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="max-w-3xl mx-auto mt-6">
        <h1 className="text-3xl mb-6">ערוך חייל</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
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
                value={rankSearch || soldier.rank}
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
            className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors duration-200"
          >
            עדכן
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditSoldierPage;
