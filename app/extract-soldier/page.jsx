"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import UnauthorizedState from "@/elements/shared/UnauthorizedState";
import Link from "next/link";

const Page = () => {
  const [inputData, setInputData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const { user, userStatus, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">טוען...</p>
      </div>
    );
  }

  if (!user) {
    return <UnauthorizedState message="צריך להתחבר על מנת לגשת לעמוד זה" />;
  }

  // Check if user status is regular
  if (userStatus === "regular" || !userStatus) {
    return <UnauthorizedState message="אין באפשרותך להוסיף חייל חדש למערכת" />;
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputData(value);

    // Show a helpful message if they paste a lot of content
    if (value.length > 500 && !infoMessage) {
      setInfoMessage(
        "זיהינו שהכנסת כמות גדולה של מידע. המערכת תנסה לחלץ את הפרטים החשובים באופן אוטומטי."
      );
    } else if (value.length <= 500) {
      setInfoMessage(null);
    }
  };

  const resetForm = () => {
    setInputData("");
    setInfoMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputData.trim()) {
      setError("נא להזין מידע");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await fetch("/api/extract-soldier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputData,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "שגיאה בעיבוד המידע");
      }

      // Instead of navigating away, show success message and soldier info
      setSuccessData({
        message: "החייל נוצר בהצלחה!",
        soldierId: data.soldierId,
        // Store any other relevant data returned from the API
      });

      // Clear the form for a new entry
      resetForm();
    } catch (err) {
      console.error("Error extracting soldier data:", err);
      setError(
        err.message || "שגיאה בעיבוד המידע - אנא נסה שנית או פנה למנהל המערכת"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto p-4" dir="rtl">
        <h1 className="text-3xl font-bold mb-6 text-center">חילוץ מידע חייל</h1>

        {successData && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold mb-1">{successData.message}</p>
                <p>חייל חדש נוסף למערכת בהצלחה!</p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/soldiers/${successData.soldierId}`}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-2"
                >
                  צפה בחייל
                </Link>
                <button
                  onClick={() => setSuccessData(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <p className="mb-4 text-gray-700">
            העתק את המידע הגולמי אודות החייל מכל מקור (טקסט ממסמך, דף אינטרנט,
            וכו׳) והדבק אותו בתיבה למטה. המערכת תשתמש ב-AI כדי לחלץ את המידע
            הרלוונטי וליצור רשומת חייל חדשה.
          </p>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {infoMessage && (
            <div
              className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <p>{infoMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="inputData"
                className="block text-gray-700 font-bold mb-2"
              >
                מידע גולמי
              </label>
              <textarea
                id="inputData"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]"
                placeholder="הדבק כאן את כל המידע הגולמי אודות החייל..."
                value={inputData}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                נקה טופס
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "מעבד..." : "חלץ מידע וצור חייל"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Page;
