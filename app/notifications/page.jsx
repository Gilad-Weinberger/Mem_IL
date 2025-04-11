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
  const router = useRouter();

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
        <h1 className="text-3xl mb-6">תגובות ממתינות לאישור</h1>
        {pendingComments.length === 0 ? (
          <p className="text-lg">אין תגובות ממתינות לאישור</p>
        ) : (
          pendingComments.map((comment, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-lg mb-4 relative"
            >
              <p className="text-sm text-gray-400">
                תגובה לחייל: {comment.soldierName}
              </p>
              <p className="text-lg font-semibold mt-2">{comment.author}</p>
              <p className="mt-2">{comment.message}</p>
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
          ))
        )}
      </div>
    </PageLayout>
  );
};

export default Page;
