"use client";

import React, { useEffect, useState } from "react";
import {
  getAllObjects,
  updateObject,
  deleteObject,
} from "@/lib/functions/dbFunctions";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

const Page = () => {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const router = useRouter();

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
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, []);

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
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, [user, userStatus]);

  const handleCommentApproval = async (commentId, approve) => {
    // Optimistically update local state
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
      // Revert local state update if API call fails
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
    <div
      className="bg-[rgb(25,25,25)] w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="max-w-3xl mx-auto mt-8">
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
      <Footer />
    </div>
  );
};

export default Page;
