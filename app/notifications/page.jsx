"use client";

import React, { use, useEffect, useState } from "react";
import {
  getAllObjects,
  getObject,
  updateObject,
  deleteObject,
} from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Page = () => {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"))?.uid;
    if (!user) return;

    const fetchPendingComments = async () => {
      try {
        const soldiers = await getAllObjects("soldiers");
        const userSoldiers = soldiers.filter(
          (soldier) => soldier.createdBy === user
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
    };

    fetchPendingComments();
  }, []);

  const handleCommentApproval = async (commentId, approve) => {
    try {
      if (approve) {
        await updateObject("comments", commentId, { status: "approved" });
      } else {
        await deleteObject("comments", commentId);
      }

      // Update local state
      setPendingComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Error handling comment:", error);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  return (
    <div
      className="bg-black w-full min-h-screen h-full px-5 pt-14 text-white"
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
