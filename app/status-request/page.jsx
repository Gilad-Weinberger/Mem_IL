"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createObject } from "@/lib/functions/dbFunctions";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const StatusForm = () => {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
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
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert("You need to connect to request a status update");
      router.push("/signin");
      return;
    }

    const newErrors = {};
    if (!form.name) newErrors.name = "שם מלא נדרש";
    if (!form.phone) newErrors.phone = "מספר טלפון נדרש";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formRequest = {
      ...form,
      uid: user.uid,
      email: user.email,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    createObject("form-requests", formRequest)
      .then(() => {
        setShowPopup(true);
      })
      .catch((error) => {
        console.error("Error creating form request:", error);
        alert("אירעה שגיאה בעת שליחת הבקשה");
      });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center gap-4">
        <p className="text-xl">צריך להתחבר על מנת לבקש עדכון סטטוס</p>
        <button
          onClick={() => router.push("/signin")}
          className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200"
        >
          OK
        </button>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">בקשתך לעדכון סטטוס בטיפול כרגע</p>
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
            בקשת עדכון סטטוס
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
              value={form.name}
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
              htmlFor="phone"
              className="block text-gray-300 mb-2 float-right"
            >
              :מספר טלפון
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="הכנס מספר טלפון"
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            />
            {errors.phone && (
              <p className="text-red-500 text-right">{errors.phone}</p>
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
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md text-white text-center">
            <p className="mb-4">בקשתך נשלחה בהצלחה</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusForm;
