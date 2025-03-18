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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Head from "next/head";
import { rankToInitials } from "@/lib/functions/rankInitials";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion"; // Import framer-motion for animations

const Page = () => {
  const [soldier, setSoldier] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({
    author: "",
    message: "",
  });
  const [commentLimit, setCommentLimit] = useState(3);
  const [showHideButton, setShowHideButton] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showExpandedQR, setShowExpandedQR] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null); // Track the authenticated user
  const [imageLimit, setImageLimit] = useState(2); // Limit for displayed images
  const [showHideImagesButton, setShowHideImagesButton] = useState(false); // Track if "הסתר" button should be shown

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

  // Memoize sorted comments by number of likes (descending)
  const sortedComments = useMemo(() => {
    return [...comments]
      .filter((comment) => comment.status === "approved")
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  }, [comments]);

  // Get displayed comments based on limit
  const displayedComments = useMemo(() => {
    return sortedComments.slice(0, commentLimit);
  }, [sortedComments, commentLimit]);

  const handleShowMore = () => {
    setCommentLimit((prev) => prev + 3);
    setShowHideButton(true);
  };

  const handleHideComments = () => {
    setCommentLimit(3);
    setShowHideButton(false);
  };

  const handleShowMoreImages = () => {
    setImageLimit((prev) => prev + 2);
  };

  const handleHideImages = () => {
    setImageLimit(2);
    setShowHideImagesButton(false);
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
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  // Function to handle liking/unliking a comment
  const handleLikeComment = async (commentId) => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      setShowLoginModal(true);
      return;
    }

    const currentUser = JSON.parse(storedUser);
    const currentUserId = currentUser.uid;

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

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  const handlePrevImage = () => {
    if (!soldier.images || soldier.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? soldier.images.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    if (!soldier.images || soldier.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === soldier.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // Clear user data from session storage
    setComments((prev) =>
      prev.map((c) => ({ ...c, likes: [] })) // Optionally reset likes in UI
    );
    alert("התנתקת בהצלחה");
  };

  return (
    <div
      className="bg-[rgb(25,25,25)] w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <Head>
        <link rel="icon" href="/favicon.svg"/>
      </Head>
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image
          src="/go-previous-svgrepo-com.svg"
          alt="Go Back"
          width={24}
          height={24}
        />
      </button>
      <Navbar onLogout={handleLogout} />
      {/* Soldier Info */}
      <div className="max-w-3xl mx-auto text-center mt-6">
        <p className="text-[40px] leading-[40px] font-extralight">
          {rankToInitials(soldier.rank)} {soldier.name}
        </p>
        <Image
          src={soldier?.images?.[0] || "/fallback.png"}
          alt="soldier"
          width={300}
          height={330}
          priority={true}
          className="w-full sm:w-[60%] md:w-[55%] h-auto object-cover rounded-lg mx-auto mt-3"
        />
        <div className="flex item-center justify-center mt-5 gap-6">
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
            <Link href={soldier.whatsapp_link} className="mt-0.5" target="_blank">
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
          <button onClick={handleQRClick} className="bg-[rgb(25,25,25)]  rounded-lg h-[42px] w-[42px] flex items-center justify-center">
            <Image 
              src="/qr-scan-svgrepo-com.svg"
              alt="qr-icon"
              width={40}
              height={40}
              className=""
            />
          </button>
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
              onClick={() => handleImageClick(index)}
              initial={{ opacity: 0, y: 20 }} // Start with opacity 0 and slightly below
              animate={{ opacity: 1, y: 0 }} // Fade in and move upwards
              transition={{ duration: 0.5, delay: index * 0.05 }} // Add slight delay for each image
            >
              <Image
                src={image}
                alt="image"
                width={1000}
                height={1000}
                className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
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
      <div className="max-w-3xl mx-auto mt-8">
        <p className="text-[30px]">תגובות</p>
        <hr className="w-[50%] mt-1 mb-4" />
        {sortedComments.length > 0 ? (
          <>
            {displayedComments.map((c, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 p-4 rounded-lg mb-4 relative"
                initial={{ opacity: 0, y: 20 }} // Start with opacity 0 and slightly below
                animate={{ opacity: 1, y: 0 }} // Fade in and move upwards
                transition={{ duration: 0.5, delay: index * 0.05 }} // Add slight delay for each comment
              >
                <p className="text-lg font-semibold">{c.author}</p>
                <p className="mt-2">{c.message}</p>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <button
                    onClick={() => handleLikeComment(c.id)}
                    className="mr-1"
                  >
                    <Image
                      src={`/heart-${c.likes?.includes(JSON.parse(sessionStorage.getItem("user"))?.uid) ? "true" : "false"}.svg`}
                      alt="like"
                      width={24}
                      height={24}
                      className={
                        c.likes?.includes(
                          JSON.parse(sessionStorage.getItem("user"))?.uid
                        )
                          ? ""
                          : "invert"
                      }
                    />
                  </button>
                  <span>{c.likes ? c.likes.length : 0}</span>
                </div>
              </motion.div>
            ))}
            {sortedComments.length > commentLimit && (
              <button
                onClick={handleShowMore}
                className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                הצג עוד
              </button>
            )}
            {showHideButton && (
              <button
                onClick={handleHideComments}
                className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-2"
              >
                הסתר
              </button>
            )}
          </>
        ) : (
          <p className="text-lg">אין תגובות עדיין.</p>
        )}
      </div>
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
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg relative">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-2 left-2 text-black text-2xl"
            >
              ×
            </button>
            <h3 className="text-black text-xl mb-4 text-center">סרוק לשיתוף</h3>
            <div className="bg-white p-4">
              <QRCodeCanvas 
                value={window.location.href}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        </div>
      )}
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
            <h3 className="text-white text-xl mb-4 text-center">התחברות נדרשת</h3>
            <p className="text-white text-center">
              עליך להתחבר כדי לבצע לייק לתגובה
            </p>
          </div>
        </div>
      )}
      {showGallery && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button 
            onClick={() => setShowGallery(false)}
            className="absolute top-4 left-4 text-white text-3xl hover:text-gray-400 z-50"
          >
            ×
          </button>
          <button 
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-400 z-50" // Ensure z-index is set
          >
            ❯
          </button>
          <div className="relative w-full h-screen flex items-center justify-center p-4">
            <Image
              src={soldier.images[currentImageIndex]}
              alt={`תמונה ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto h-auto object-contain"
              priority={true}
            />
          </div>
          <button 
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-400 z-50" // Ensure z-index is set
          >
            ❮
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {currentImageIndex + 1} / {soldier.images.length}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Page;