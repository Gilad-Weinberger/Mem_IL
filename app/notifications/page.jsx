"use client";

import React, { useEffect, useState } from "react";
import {
  getAllObjects,
  updateObject,
  deleteObject,
} from "@/lib/functions/dbFunctions";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import Image from "next/image";

const Page = () => {
  const { user, userStatus, loading } = useAuth();
  const [pendingComments, setPendingComments] = useState([]);
  const [pendingStatusRequests, setPendingStatusRequests] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const router = useRouter();

  // Toggle function to show only one section at a time
  const toggleSection = (section) => {
    if (section === "comments") {
      setShowComments(!showComments);
      if (!showComments) setShowRequests(false);
    } else if (section === "requests") {
      setShowRequests(!showRequests);
      if (!showRequests) setShowComments(false);
    }
  };

  useEffect(() => {
    if (user && userStatus !== "regular") {
      const unsubscribe = onSnapshot(collection(db, "comments"), async () => {
        try {
          const soldiers = await getAllObjects("soldiers");
          const userSoldiers = soldiers.filter(
            (soldier) => soldier.createdBy === user.uid
          );

          const allComments = await getAllObjects("comments");
          const pendingComments = allComments.filter(
            (comment) =>
              comment.status === "pending" &&
              userSoldiers.some((soldier) => soldier.id === comment.soldierId)
          );

          // Add soldier names to comments
          const commentsWithSoldierNames = pendingComments.map((comment) => ({
            ...comment,
            soldierName:
              userSoldiers.find((s) => s.id === comment.soldierId)?.name ||
              "Unknown",
          }));

          setPendingComments(commentsWithSoldierNames);
        } catch (error) {
          console.error("Error fetching pending comments:", error);
        }
      });

      // Only admins can see status change requests
      if (userStatus === "admin") {
        const statusUnsubscribe = onSnapshot(
          collection(db, "statusRequests"),
          async () => {
            try {
              const allStatusRequests = await getAllObjects("statusRequests");
              const pendingStatusRequests = allStatusRequests.filter(
                (request) => request.status === "pending"
              );

              // Get user info for each request
              const allUsers = await getAllObjects("users");
              // Get soldiers info for relationship context
              const allSoldiers = await getAllObjects("soldiers");

              const requestsWithUserInfo = pendingStatusRequests.map(
                (request) => {
                  const userInfo = allUsers.find(
                    (user) => user.id === request.userId
                  );
                  // Find soldier info if there's a soldierId in the request
                  const soldierInfo = request.soldierId
                    ? allSoldiers.find(
                        (soldier) => soldier.id === request.soldierId
                      )
                    : null;

                  return {
                    ...request,
                    userEmail: userInfo?.email || "Unknown User",
                    userName: userInfo?.displayName || "Unknown User",
                    fullName:
                      request.fullName || userInfo?.displayName || "Unknown",
                    soldierName:
                      request.soldierName ||
                      (soldierInfo ? soldierInfo.name : ""),
                    relation: request.relation || "",
                  };
                }
              );

              setPendingStatusRequests(requestsWithUserInfo);
            } catch (error) {
              console.error("Error fetching pending status requests:", error);
            }
          }
        );

        return () => {
          unsubscribe();
          statusUnsubscribe();
        };
      }

      return () => unsubscribe();
    }
  }, [user, userStatus]);

  const handleCommentApproval = async (commentId, approve) => {
    setPendingComments((prev) =>
      prev.filter((comment) => comment.id !== commentId)
    );

    try {
      if (approve) {
        await updateObject("comments", commentId, { status: "approved" });
      } else {
        await deleteObject("comments", commentId);
      }
    } catch (error) {
      console.error("Error handling comment:", error);
      setPendingComments((prev) => [
        ...prev,
        pendingComments.find((comment) => comment.id === commentId),
      ]);
    }
  };

  const handleStatusRequestApproval = async (requestId, userId, approve) => {
    setPendingStatusRequests((prev) =>
      prev.filter((request) => request.id !== requestId)
    );

    try {
      if (approve) {
        // Approve request and update user status to "family"
        await updateObject("statusRequests", requestId, { status: "approved" });
        await updateObject("users", userId, { status: "family" });
      } else {
        // Reject request
        await updateObject("statusRequests", requestId, { status: "rejected" });
      }
    } catch (error) {
      console.error("Error handling status request:", error);
      setPendingStatusRequests((prev) => [
        ...prev,
        pendingStatusRequests.find((request) => request.id === requestId),
      ]);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus === "regular") {
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
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl">תגובות ממתינות לאישור</h1>
          {pendingComments.length > 0 && (
            <button
              onClick={() => toggleSection("comments")}
              className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Image
                src="/previous.svg"
                alt="Toggle"
                width={20}
                height={20}
                className={`transform transition-transform ${showComments ? "rotate-90" : "-rotate-90"}`}
              />
            </button>
          )}
        </div>
        {showComments &&
          (pendingComments.length === 0 ? (
            <p className="text-lg mb-8">אין תגובות ממתינות לאישור</p>
          ) : (
            <div className="mb-8">
              {pendingComments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg mb-4 relative"
                >
                  <p className="text-sm text-gray-400">
                    תגובה לחייל: {comment.soldierName}
                  </p>
                  <p className="text-lg font-semibold mt-2">{comment.author}</p>
                  <p className="mt-2 mb-10">{comment.message}</p>
                  <div className="flex gap-4 mt-4 absolute left-2 bottom-2">
                    <button
                      onClick={() => handleCommentApproval(comment.id, true)}
                      className="bg-green-600 px-4 py-1 rounded-lg hover:bg-green-700"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleCommentApproval(comment.id, false)}
                      className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        {userStatus === "admin" && (
          <>
            <div className="flex items-center justify-between mb-4 mt-8">
              <h1 className="text-3xl">בקשות סטטוס ממתינות</h1>
              {pendingStatusRequests.length > 0 && (
                <button
                  onClick={() => toggleSection("requests")}
                  className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <Image
                    src="/previous.svg"
                    alt="Toggle"
                    width={20}
                    height={20}
                    className={`transform transition-transform ${showRequests ? "-rotate-90" : "rotate-0"}`}
                  />
                </button>
              )}
            </div>

            {showRequests &&
              (pendingStatusRequests.length === 0 ? (
                <p className="text-lg">אין בקשות סטטוס ממתינות לאישור</p>
              ) : (
                pendingStatusRequests.map((request, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-4 rounded-lg mb-4 relative"
                  >
                    <p className="text-lg font-semibold mt-2">
                      {request.userEmail}
                    </p>
                    <p className="text-sm text-gray-400">
                      שם מלא: {request.fullName}
                    </p>
                    {request.soldierName && (
                      <p className="text-sm text-gray-400">
                        חייל: {request.soldierName}
                      </p>
                    )}
                    {request.relation && (
                      <p className="text-sm text-gray-400">
                        קשר לחייל: {request.relation}
                      </p>
                    )}
                    <p className="mt-2 mb-10">
                      סיבת הבקשה: {request.reason || "לא צוין"}
                    </p>
                    <div className="flex gap-4 mt-4 absolute left-2 bottom-2">
                      <button
                        onClick={() =>
                          handleStatusRequestApproval(
                            request.id,
                            request.userId,
                            true
                          )
                        }
                        className="bg-green-600 px-4 py-1 rounded-lg hover:bg-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() =>
                          handleStatusRequestApproval(
                            request.id,
                            request.userId,
                            false
                          )
                        }
                        className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                ))
              ))}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Page;
