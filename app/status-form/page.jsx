"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { createObject, getObjectsByField } from "@/lib/functions/dbFunctions";
import NotificationModal from "@/elements/soldier-details/NotificationModal";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState("");
  const [soldierName, setSoldierName] = useState("");
  const [relation, setRelation] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // null, "pending", "approved", "blocked"
  const { user, userStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  // Check for existing status requests
  useEffect(() => {
    if (user) {
      const checkExistingRequests = async () => {
        try {
          const existingRequests = await getObjectsByField(
            "statusRequests",
            "userId",
            user.uid
          );

          // Sort by creation date (newest first) to get the most recent status
          const sortedRequests = existingRequests.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          if (sortedRequests.length > 0) {
            const latestRequest = sortedRequests[0];
            setRequestStatus(latestRequest.status);
          }
        } catch (err) {
          console.error("Error checking existing requests:", err);
        } finally {
          setLoading(false);
        }
      };

      checkExistingRequests();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !soldierName.trim() || !relation.trim()) {
      setError("יש למלא את כל השדות");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const statusFormData = {
        fullName,
        soldierName,
        relation,
        userId: user.uid,
        userEmail: user.email,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await createObject("statusRequests", statusFormData);

      // Reset form
      setFullName("");
      setSoldierName("");
      setRelation("");

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error submitting status form:", err);
      setError("אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus !== "regular") {
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
        <p className="text-xl">אין לך הרשאה לגשת לעמוד זה</p>
      </div>
    );
  }

  if (!user) {
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
        <p className="text-xl">צריך להתחבר על מנת לגשת לעמוד זה</p>
      </div>
    );
  }

  // Handle different request statuses
  if (requestStatus === "pending") {
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
        <div className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            בקשה בתהליך
          </h2>
          <p className="text-white mb-4">
            יש לך כבר בקשה לשדרוג סטטוס בתהליך בדיקה. אנא המתן עד שצוות האתר
            יבדוק את בקשתך הקיימת.
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="w-full rounded bg-dark-blue p-3 font-semibold text-white hover:bg-darker-blue mt-4"
          >
            חזור לפרופיל
          </button>
        </div>
      </div>
    );
  }

  if (requestStatus === "approved") {
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
        <div className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            בקשה אושרה
          </h2>
          <p className="text-white mb-4">
            בקשתך לשדרוג סטטוס כבר אושרה! הסטטוס שלך כעת הוא "משפחה".
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="w-full rounded bg-dark-blue p-3 font-semibold text-white hover:bg-darker-blue mt-4"
          >
            חזור לפרופיל
          </button>
        </div>
      </div>
    );
  }

  if (requestStatus === "blocked" || requestStatus === "rejected") {
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
        <div className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            בקשה נדחתה
          </h2>
          <p className="text-white mb-4">
            לצערנו, בקשתך האחרונה לשדרוג סטטוס נדחתה. אם אתה מאמין שזו טעות, אנא
            צור קשר עם צוות האתר.
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="w-full rounded border border-gray-600 p-3 font-semibold text-white hover:border-indigo-500 mt-3"
          >
            חזור לפרופיל
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-900 p-4"
      dir="rtl"
    >
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
      </button>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-md text-right"
      >
        <h2 className="mb-6 text-center text-3xl font-bold text-white">
          טופס סטטוס
        </h2>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">שם מלא</label>
          <input
            dir="rtl"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="הכנס שם מלא"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">שם החייל</label>
          <input
            dir="rtl"
            type="text"
            value={soldierName}
            onChange={(e) => setSoldierName(e.target.value)}
            required
            placeholder="הכנס שם החייל"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">קשר לחייל</label>
          <input
            dir="rtl"
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            required
            placeholder="הכנס קשר לחייל (למשל: אח, אחות, הורה)"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="mb-5 text-center text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-dark-blue p-3 font-semibold text-white hover:bg-darker-blue disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "שולח..." : "שלח"}
        </button>
      </form>
      <NotificationModal
        showModal={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/profile");
        }}
        title="הבקשה נשלחה בהצלחה"
        message="בקשתך לשדרוג סטטוס נשלחה בהצלחה ותיבדק בקרוב על ידי המנהלים."
      />
    </div>
  );
};

export default Page;
