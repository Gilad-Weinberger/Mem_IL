"use client";

import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Import Firebase auth
import { auth } from "@/lib/firebase"; // Ensure you have Firebase initialized
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getObject,
  createObject,
  updateObject,
  getObjectsByField,
} from "@/lib/functions/dbFunctions";
import { rankToInitials } from "@/lib/functions/rankInitials";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import ShowComments from "@/elements/ShowComments";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

const Page = () => {
  const [soldier, setSoldier] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({
    author: "",
    message: "",
  });
  const [showExpandedQR, setShowExpandedQR] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null); // Track the authenticated user
  const [imageLimit, setImageLimit] = useState(2); // Limit for displayed images
  const [showHideImagesButton, setShowHideImagesButton] = useState(false);
  const [showCommentSentPopup, setShowCommentSentPopup] = useState(false); // State for pop-up visibility

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          sessionStorage.setItem("user", JSON.stringify(authUser));
          setUser(authUser);
        }
      } else {
        sessionStorage.removeItem("user"); // Clear session storage on logout
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (id) {
      setLoading(true);
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
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleShowMoreImages = () => {
    setImageLimit((prev) => prev + 2);
  };

  const handleHideImages = () => {
    setImageLimit(2);
    setShowHideImagesButton(false);
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setComment((prevComment) => ({
      ...prevComment,
      [name]: value,
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!comment.author.trim() || !comment.message.trim()) {
      alert("נא למלא את כל השדות!");
      return;
    }

    const newComment = {
      ...comment,
      soldierId: id,
      likes: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    createObject("comments", newComment)
      .then(() => {
        setComment({ author: "", message: "" });
        setComments((prev) => [...prev, newComment]);
        setShowCommentSentPopup(true);
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  // Function to handle liking/unliking a comment
  const handleLikeComment = async (commentId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const currentUserId = user.uid;

    // Find the comment to update
    const commentToUpdate = comments.find((c) => c.id === commentId);
    if (!commentToUpdate) return;

    // Create new likes array
    const likes = commentToUpdate.likes || [];
    const newLikes = likes.includes(currentUserId)
      ? likes.filter((uid) => uid !== currentUserId)
      : [...likes, currentUserId];

    // Optimistically update the UI
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: newLikes } : c))
    );

    try {
      // Update the database
      await updateObject("comments", commentId, { likes: newLikes });
    } catch (err) {
      console.error("Error updating like:", err);
      // Revert the optimistic update on error
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
      setShowQRModal(true);
    }
  };

  const handleQRClick = () => {
    setShowExpandedQR(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    router.push("/signup");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // Clear user data from session storage
    setComments(
      (prev) => prev.map((c) => ({ ...c, likes: [] })) // Optionally reset likes in UI
    );
    alert("התנתקת בהצלחה");
  };

  if (loading) {
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

  // If soldier is still null, show an error message
  if (!soldier) {
    return (
      <div className="text-white text-center text-xl mt-10">
        שגיאה בטעינת המידע
      </div>
    );
  }

  return (
    <div
      className="bg-[rgb(25,25,25)] w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
      </button>
      <Navbar onLogout={handleLogout} />
      {/* Soldier Info */}
      <div className="max-w-3xl mx-auto text-center mt-6">
        <p className="text-[40px]  mt-1 leading-[40px] font-extralight">
          {rankToInitials(soldier.rank)} {soldier.name}
        </p>
        <Image
          src={soldier?.images?.[0] || ""}
          alt="soldier"
          width={300}
          height={330}
          priority={true}
          className="w-full sm:w-[60%] md:w-[55%] h-auto object-cover rounded-lg mx-auto mt-3"
        />
        <div className="flex flex-wrap item-center justify-center mt-5 gap-6">
          {soldier.instagram_link && (
            <Link href={soldier.instagram_link} target="_blank">
              <Image
                src={"/instagram.svg"}
                alt="instagram-icon"
                width={42}
                height={42}
                className="invert"
              />
            </Link>
          )}
          {soldier.facebook_link && (
            <Link href={soldier.facebook_link} target="">
              <Image
                src={"/facebook.svg"}
                alt="facebook-icon"
                width={42}
                height={42}
                className="invert"
              />
            </Link>
          )}
          {soldier.whatsapp_link && (
            <Link
              href={soldier.whatsapp_link}
              className="mt-0.5"
              target="_blank"
            >
              <Image
                src={"/whatsapp.svg"}
                alt="whatsapp-icon"
                width={40}
                height={40}
                className="invert"
              />
            </Link>
          )}
          <button onClick={handleShare} className="mt-0.5">
            <Image
              src={"/share.svg"}
              alt="share-icon"
              width={40}
              height={40}
              className="invert"
            />
          </button>
          <button
            onClick={handleQRClick}
            className="bg-[rgb(25,25,25)]  rounded-lg h-[42px] w-[42px] flex items-center justify-center"
          >
            <Image
              src="/qr.svg"
              alt="qr-icon"
              width={40}
              height={40}
              className=""
            />
          </button>
          {user && user.uid === soldier.createdBy && (
            <Link
              href={`/edit-soldier/${id}`}
              className="inline-block px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
            >
              ערוך חייל
            </Link>
          )}
        </div>
      </div>
      {/* Life Story */}
      <div className="max-w-3xl mx-auto mt-6">
        <p className="text-[30px]">סיפור חיים</p>
        <hr className="w-[50%] mt-1" />
        <p className="mt-2 text-lg">{soldier.lifeStory}</p>
      </div>
      {/* Images Section */}
      <div className="max-w-3xl mx-auto mt-6">
        <p className="text-[30px]">תמונות</p>
        <hr className="w-[50%] mt-1" />
        <div className="flex flex-wrap justify-between gap-4 mt-3">
          {(soldier.images || []).slice(0, imageLimit).map((image, index) => (
            <motion.div
              key={index}
              className="w-[47%] cursor-pointer"
              initial={{ opacity: 0, y: 20 }} // Start with opacity 0 and slightly below
              animate={{ opacity: 1, y: 0 }} // Fade in and move upwards
              transition={{ duration: 0.5, delay: index * 0.05 }} // Add slight delay for each image
            >
              <Image
                src={image}
                alt="image"
                width={1000}
                height={1000}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          ))}
        </div>
        {soldier.images && imageLimit < soldier.images.length && (
          <button
            onClick={() => {
              handleShowMoreImages();
              setShowHideImagesButton(true);
            }}
            className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-4"
          >
            הצג עוד
          </button>
        )}
        {showHideImagesButton && (
          <button
            onClick={handleHideImages}
            className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-2"
          >
            הסתר
          </button>
        )}
      </div>
      {/* Comments Section */}
      <ShowComments
        comments={comments}
        user={user}
        handleLikeComment={handleLikeComment}
      />
      {/* Comments Form */}
      <div className="max-w-3xl mx-auto mt-8">
        <form
          onSubmit={handleCommentSubmit}
          onChange={handleCommentChange}
          className="w-full bg-[rgb(25,25,25)] p-6 rounded-lg shadow-lg"
        >
          <p className="text-[22px]">יש לכם משהו להוסיף?</p>
          <hr className="w-[90%] mt-1 mb-4" />
          <input
            type="text"
            name="author"
            value={comment.author}
            onChange={handleCommentChange}
            placeholder="שם הכותב/ת"
            className="w-full rounded-lg mt-3 text-black pr-2 py-2 text-lg"
          />
          <textarea
            name="message"
            value={comment.message}
            onChange={handleCommentChange}
            className="w-full mt-3 rounded-lg h-[120px] text-black pr-2 py-2 text-lg"
            placeholder="תכתבו כאן..."
          ></textarea>
          <button
            type="submit"
            className="w-full mt-2 rounded-lg hover:text-black hover:bg-white border border-white py-2 text-lg transition-all duration-200"
          >
            שלח
          </button>
        </form>
      </div>
      {showExpandedQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[rgb(25,25,25)] p-6 rounded-lg relative">
            <button
              onClick={() => setShowExpandedQR(false)}
              className="absolute top-2 left-2 text-white text-2xl hover:text-gray-400"
            >
              ×
            </button>
            <h3 className="text-white text-xl mb-4 text-center">סרוק לשיתוף</h3>
            <div className="bg-[rgb(25,25,25)] p-4">
              <QRCodeCanvas
                value={window.location.href}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#FFFFFF"
                bgColor="rgb(25,25,25)"
              />
            </div>
          </div>
        </div>
      )}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[rgb(25,25,25)] p-6 rounded-lg relative max-w-sm mx-4">
            <button
              onClick={handleCloseLoginModal}
              className="absolute top-2 left-2 text-white text-2xl hover:text-gray-400"
            >
              ×
            </button>
            <h3 className="text-white text-xl mb-4 text-center">
              התחברות נדרשת
            </h3>
            <p className="text-white text-center">
              עליך להתחבר כדי לבצע לייק לתגובה
            </p>
          </div>
        </div>
      )}
      {showCommentSentPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[rgb(25,25,25)] p-6 rounded-lg relative max-w-sm mx-4">
            <button
              onClick={() => setShowCommentSentPopup(false)}
              className="absolute top-2 left-2 text-white text-2xl hover:text-gray-400"
            >
              ×
            </button>
            <h3 className="text-white text-xl mb-4 text-center">
              התגובה שלך נשלחה והיא ממתינה לאישור
            </h3>
            <button
              onClick={() => setShowCommentSentPopup(false)}
              className="w-full mt-2 rounded-lg hover:text-black hover:bg-white border border-white py-2 text-lg transition-all duration-200"
            >
              אישור
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Page;
