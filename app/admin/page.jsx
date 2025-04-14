"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllObjects, deleteObject } from "@/lib/functions/dbFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { warsList } from "@/lib/data/wars";

const Page = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [warFilter, setWarFilter] = useState("");
  const [showWarOptions, setShowWarOptions] = useState(false);
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleWarSelect = (war) => {
    setWarFilter(war);
    setShowWarOptions(false);
  };

  // Filter soldiers based on search query and selected war
  const filteredSoldiers = useMemo(() => {
    return soldiers.filter((soldier) => {
      const matchesSearch = soldier.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesWar =
        !warFilter ||
        soldier.warFellIn?.toLowerCase().includes(warFilter.toLowerCase());
      return matchesSearch && matchesWar;
    });
  }, [soldiers, searchQuery, warFilter]);

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus !== "admin") {
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

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-3 w-full">
          {/* Name search */}
          <div className="relative flex w-full md:w-1/2">
            <input
              type="text"
              dir="rtl"
              placeholder="חפש חייל/ת..."
              className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Image
              src="/search.svg"
              alt="search"
              width={22}
              height={22}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
          </div>
          {/* War filter dropdown */}
          <div className="relative flex w-full md:w-1/2">
            <input
              type="text"
              dir="rtl"
              placeholder="סנן לפי מלחמה..."
              className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
              value={warFilter}
              onChange={(e) => setWarFilter(e.target.value)}
              onFocus={() => setShowWarOptions(true)}
            />
            <Image
              src="/search.svg"
              alt="search"
              width={22}
              height={22}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            {showWarOptions && (
              <div className="absolute z-50 w-full mt-1 top-full right-0 bg-white rounded-lg max-h-60 overflow-y-auto">
                {warsList
                  .filter((war) =>
                    war.toLowerCase().includes(warFilter.toLowerCase())
                  )
                  .map((war) => (
                    <div
                      key={war}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-black text-right"
                      onClick={() => handleWarSelect(war)}
                    >
                      {war}
                    </div>
                  ))}
              </div>
            )}
          </div>
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
          ) : filteredSoldiers.length === 0 ? (
            <p className="text-center w-full text-lg">
              לא נמצאו חיילים מתאימים
            </p>
          ) : (
            <>
              {filteredSoldiers.map((soldier) => (
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
