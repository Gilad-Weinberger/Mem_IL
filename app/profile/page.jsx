"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { getAllObjects } from "@/lib/functions/dbFunctions";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSoldiers, setUserSoldiers] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const { user, userStatus, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          // Fetch soldiers created by the user
          const soldiers = await getAllObjects("soldiers");
          const userCreatedSoldiers = soldiers.filter(
            soldier => soldier.createdBy === user.uid
          );
          setUserSoldiers(userCreatedSoldiers);

          // Fetch comments written by the user
          const comments = await getAllObjects("comments");
          // Associate each comment with the soldier name
          const commentsWithSoldierNames = await Promise.all(
            comments
              .filter(comment => comment.author) // Filter comments with author
              .map(async (comment) => {
                const soldier = soldiers.find(s => s.id === comment.soldierId);
                return {
                  ...comment,
                  soldierName: soldier ? soldier.name : "Unknown"
                };
              })
          );
          setUserComments(commentsWithSoldierNames);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("שגיאה בטעינת נתוני המשתמש");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Error during logout:", error);
      setError("שגיאה בהתנתקות");
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
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
      <div className="max-w-3xl mx-auto" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">פרופיל משתמש</h1>
          <p className="text-xl">{user.email}</p>
          <div className="mt-2">
            <span className="inline-block px-3 py-1 bg-dark-blue rounded-full text-white">
              סטטוס: {userStatus || "רגיל"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-600 hover:bg-red-700 transition px-6 py-2 rounded-lg flex items-center mx-auto"
          >
            <Image src="/signout.svg" alt="Logout" width={20} height={20} className="invert ml-2" />
            התנתק
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">חיילים שהוספת</h2>
          {userSoldiers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userSoldiers.map((soldier) => (
                <div 
                  key={soldier.id} 
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => router.push(`/soldiers/${soldier.id}`)}
                >
                  <Image
                    src={soldier.images?.[0] || ""}
                    alt={soldier.name}
                    width={150}
                    height={150}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <p className="mt-2 text-center">{soldier.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">לא הוספת חיילים עדיין</p>
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">תגובות שלך</h2>
          {userComments.length > 0 ? (
            <div className="space-y-4">
              {userComments.map((comment, index) => (
                <CommentCard key={index} comment={comment} user={user} handlehandleLikeComment={null} />
              ))}
            </div>
          ) : (
            <p className="text-center">לא כתבת תגובות עדיין</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Page;