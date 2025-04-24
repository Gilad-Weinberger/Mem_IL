"use client";

import React, { useEffect, useState } from "react";
import {
  getAllObjects,
  updateObject,
  deleteObject,
} from "@/lib/functions/dbFunctions";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/shared/layout/PageLayout";

// Import the new components
import NotificationHeader from "@/components/notifications/NotificationHeader";
import PendingCommentsList from "@/components/notifications/PendingCommentsList";
import StatusRequestsList from "@/components/notifications/StatusRequestsList";
import UnauthorizedState from "@/components/shared/ui/UnauthorizedState";

const Page = () => {
  const { user, userStatus, loading } = useAuth();
  const [pendingComments, setPendingComments] = useState([]);
  const [pendingStatusRequests, setPendingStatusRequests] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [showRequests, setShowRequests] = useState(true);

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
    return <UnauthorizedState message="אין לך הרשאה לגשת לעמוד זה" />;
  }

  if (!user) {
    return <UnauthorizedState message="צריך להתחבר על מנת לגשת לעמוד זה" />;
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto w-full">
        {/* Comments section */}
        <NotificationHeader
          title="תגובות ממתינות לאישור"
          hasItems={pendingComments.length > 0}
          isShowing={showComments}
          toggleSection={toggleSection}
          section="comments"
        />
        <PendingCommentsList
          pendingComments={pendingComments}
          handleCommentApproval={handleCommentApproval}
          showComments={showComments}
        />
        {/* Status requests section (admins only) */}
        {userStatus === "admin" && (
          <>
            <NotificationHeader
              title="בקשות סטטוס ממתינות"
              hasItems={pendingStatusRequests.length > 0}
              isShowing={showRequests}
              toggleSection={toggleSection}
              section="requests"
            />
            <StatusRequestsList
              pendingStatusRequests={pendingStatusRequests}
              handleStatusRequestApproval={handleStatusRequestApproval}
              showRequests={showRequests}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Page;
