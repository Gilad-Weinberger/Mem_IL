"use client";

import { useState, useEffect } from "react";
import { getAllObjects, deleteObject } from "@/lib/functions/dbFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";

const Page = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, userStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        const data = await getAllObjects("soldiers");
        setSoldiers(data);
      } catch (error) {
        console.error("Error fetching soldiers:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldiers();
  }, []);

  const handleDelete = async (e, soldierId) => {
    e.preventDefault();
    if (window.confirm("האם אתה בטוח שברצונך למחוק חייל זה?")) {
      try {
        await deleteObject("soldiers", soldierId);
        setSoldiers(soldiers.filter((soldier) => soldier.id !== soldierId));
      } catch (error) {
        console.error("Error deleting soldier:", error);
        alert("שגיאה במחיקת החייל");
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus === "regular") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">אין לך הרשאה לגשת לעמוד זה</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">צריך להתחבר על מנת לגשת לעמוד זה</p>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full">
        <div className="relative flex justify-center w-full">
          <input
            type="text"
            dir="rtl"
            placeholder="חפש חייל/ת..."
            className="w-full md:w-3/4 lg:w-1/2 rounded-lg py-2 pr-4 pl-10 md:pl-12 text-black"
          />
          <Image
            src="/search.svg"
            alt="search"
            width={22}
            height={22}
            className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2"
          />
        </div>
        <div className="text-center w-full mt-6">
          <p className="text-2xl md:text-3xl font-semibold">ארכיון החיילים</p>
          <hr className="w-full mt-2 border-gray-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {error ? (
            <p className="text-center w-full text-lg text-red-500">
              הייתה שגיאה בטעינת החיילים
            </p>
          ) : soldiers.length === 0 ? (
            <p className="text-center w-full text-lg">רשימת החיילים ריקה</p>
          ) : (
            <>
              {soldiers.map((soldier) => (
                <div key={soldier.id} className="relative group">
                  <Image
                    src={soldier.images[0] || "/nevo.jpeg"}
                    alt="soldier-image"
                    width={150}
                    height={150}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <p className="mt-2 text-lg md:text-xl">
                    {soldier.darga} {soldier.name}
                  </p>
                  <button
                    onClick={(e) => handleDelete(e, soldier.id)}
                    className="absolute bottom-[43px] left-1.5 bg-red-500 p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Image
                      src="/bin.svg"
                      alt="delete"
                      width={20}
                      height={20}
                      className="invert"
                    />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Page;
