"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/shared/layout/PageLayout";
import { getAllObjects, getObjectsByField } from "@/lib/functions/dbFunctions";
import CommentCard from "@/components/soldier-details/CommentCard";
import USER_STATUSES from "@/lib/data/statuses";
import Link from "next/link";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSoldiers, setUserSoldiers] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [statusRequest, setStatusRequest] = useState(null);
  const { user, userStatus, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          // Fetch soldiers created by the user
          const soldiers = await getAllObjects("soldiers");
          const userCreatedSoldiers = soldiers.filter(
            (soldier) => soldier.createdBy === user.uid
          );
          setUserSoldiers(userCreatedSoldiers);

          // Fetch comments written by the user
          const comments = await getAllObjects("comments");
          // Associate each comment with the soldier name
          const commentsWithSoldierNames = await Promise.all(
            comments
              .filter((comment) => comment.author) // Filter comments with author
              .map(async (comment) => {
                const soldier = soldiers.find(
                  (s) => s.id === comment.soldierId
                );
                return {
                  ...comment,
                  soldierName: soldier ? soldier.name : "Unknown",
                };
              })
          );
          setUserComments(commentsWithSoldierNames);

          // Check for existing status requests
          if (userStatus === "regular") {
            const existingRequests = await getObjectsByField(
              "statusRequests",
              "userId",
              user.uid
            );

            // Sort by creation date (newest first)
            const sortedRequests = existingRequests.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            if (sortedRequests.length > 0) {
              setStatusRequest(sortedRequests[0]);
            }
          }
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
  }, [user, userStatus]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/signin");
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
      <div className="max-w-3xl mx-auto relative" dir="rtl">
        {/* Go Back Button */}
        <button
          onClick={() => router.back()}
          className="fixed top-4 left-4 p-2 rounded"
        >
          <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
        </button>
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold mb-2">פרופיל משתמש</h1>
          <p className="text-xl">{user.email}</p>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <button
          onClick={handleLogout}
          className="my-5 bg-red-600 hover:bg-red-700 transition gap-2 px-6 py-2 rounded-lg flex items-center mx-auto"
        >
          <Image
            src="/signout.svg"
            alt="Logout"
            width={20}
            height={20}
            className="invert"
          />
          התנתק
        </button>
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">סטטוס משתמש</h2>
          <div className="text-center flex flex-col gap-1">
            <span className="inline-block px-4 py-2 bg-dark-blue rounded-full text-white">
              {userStatus
                ? USER_STATUSES[userStatus]
                : USER_STATUSES["regular"]}
            </span>

            {/* Status request information */}
            {statusRequest && statusRequest.status === "pending" && (
              <div className="mt-3 bg-yellow-600 rounded-lg p-3 text-white">
                <p>בקשתך לשדרוג סטטוס נשלחה ומחכה לאישור</p>
                <p className="text-sm mt-1">
                  נשלח:{" "}
                  {new Date(statusRequest.createdAt).toLocaleDateString(
                    "he-IL"
                  )}
                </p>
              </div>
            )}

            {statusRequest && statusRequest.status === "rejected" && (
              <div className="mt-3 bg-red-600 rounded-lg p-3 text-white">
                <p>בקשתך לשדרוג סטטוס נדחתה</p>
                <p className="text-sm mt-1">ניתן להגיש בקשה חדשה</p>
              </div>
            )}

            {(!statusRequest || statusRequest.status === "rejected") &&
              (!userStatus || userStatus === "regular") && (
                <Link
                  href="/status-form"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg"
                >
                  שדרג סטטוס
                </Link>
              )}
          </div>
        </div>
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
            <div className="text-center">
              <p>לא הוספת חיילים עדיין</p>
              {userStatus && userStatus !== "regular" && (
                <Link
                  href="/add-soldier"
                  className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg"
                >
                  הוסף חייל
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">תגובות שלך</h2>
          {userComments.length > 0 ? (
            <div className="space-y-4">
              {userComments.map((comment, index) => (
                <CommentCard
                  key={comment.id || index}
                  comment={comment}
                  user={user}
                  handleLikeComment={null}
                  index={index}
                  showSoldierName={true}
                />
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
