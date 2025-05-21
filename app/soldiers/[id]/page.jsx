"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  getObject,
  updateObject,
  getObjectsByField,
} from "@/lib/functions/dbFunctions";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/shared/layout/PageLayout";
import SoldierHeader from "@/components/soldier-details/SoldierHeader";
import SoldierLifeStory from "@/components/soldier-details/SoldierLifeStory";
import SoldierImages from "@/components/soldier-details/SoldierImages";
import SoldierLocationConnection from "@/components/soldier-details/SoldierLocationConnection";
import ShowComments from "@/components/soldier-details/ShowComments";
import CommentForm from "@/components/soldier-details/CommentForm";
import SocialLinks from "@/components/soldier-details/SocialLinks";
import QRModal from "@/components/soldier-details/QRModal";
import NotificationModal from "@/components/soldier-details/NotificationModal";

const Page = () => {
  const { user, loading } = useAuth();
  const [soldier, setSoldier] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [showExpandedQR, setShowExpandedQR] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCommentSentPopup, setShowCommentSentPopup] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      Promise.all([
        getObject("soldiers", id),
        getObjectsByField("comments", "soldierId", id),
      ])
        .then(([soldierData, commentsData]) => {
          if (!soldierData) {
            setError(new Error("לא נמצא חייל"));
          } else {
            setSoldier(soldierData);
            setComments(commentsData || []);
          }
        })
        .catch((err) => setError(err));
    }
  }, [id]);

  const handleLikeComment = async (commentId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const currentUserId = user.uid;
    const commentToUpdate = comments.find((c) => c.id === commentId);
    if (!commentToUpdate) return;

    const likes = commentToUpdate.likes || [];
    const newLikes = likes.includes(currentUserId)
      ? likes.filter((uid) => uid !== currentUserId)
      : [...likes, currentUserId];

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: newLikes } : c))
    );

    try {
      await updateObject("comments", commentId, { likes: newLikes });
    } catch (err) {
      console.error("Error updating like:", err);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: likes } : c))
      );
      alert("שגיאה בעדכון הלייק, נסה שוב");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${soldier.rank} ${soldier.name}`,
          text: `${soldier.rank} ${soldier.name}:\n${window.location.href}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowExpandedQR(true);
    }
  };

  const handleQRClick = () => {
    setShowExpandedQR(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    router.push("/auth/signup");
  };

  const handleNewComment = (newComment) => {
    setComments((prev) => [...prev, newComment]);
    setShowCommentSentPopup(true);
  };

  if (loading || !soldier) {
    return (
      <div className="text-white text-center text-xl mt-10">טוען מידע...</div>
    );
  }

  if (error) {
    return (
      <div className="text-white text-center text-xl mt-10">
        שגיאה בטעינת המידע: {error.message}
      </div>
    );
  }

  return (
    <PageLayout>
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
      </button>

      <SoldierHeader soldier={soldier} id={id} handleQRClick={handleQRClick} />

      <SoldierLifeStory lifeStory={soldier.lifeStory} />

      {/*<SoldierLocationConnection locationConnection={soldier.locationConnection} />*/}

      <SoldierImages images={soldier.images} />

      <ShowComments
        comments={comments}
        user={user}
        handleLikeComment={handleLikeComment}
      />

      <CommentForm
        soldierId={id}
        onCommentSubmit={handleNewComment}
        showLoginModal={() => setShowLoginModal(true)}
      />

      <SocialLinks soldier={soldier} handleShare={handleShare} />

      <QRModal
        showModal={showExpandedQR}
        onClose={() => setShowExpandedQR(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />

      <NotificationModal
        showModal={showLoginModal}
        onClose={handleCloseLoginModal}
        title="התחברות נדרשת"
        message="עליך להתחבר כדי לבצע לייק לתגובה"
      />

      <NotificationModal
        showModal={showCommentSentPopup}
        onClose={() => setShowCommentSentPopup(false)}
        title="התגובה שלך נשלחה והיא ממתינה לאישור"
        message=""
      />
    </PageLayout>
  );
};

export default Page;
