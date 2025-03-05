"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  getObject,
  createObject,
  updateObject,
  getObjectsByField,
} from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Page = () => {
  const [soldier, setSoldier] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({
    author: "",
    message: "",
  });
  const { id } = useParams();
  const router = useRouter();

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
  console.log(sortedComments);

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
  const handleLikeComment = (commentId) => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      alert("עליך להתחבר כדי לבצע לייק!");
      router.push("/signup");
      return;
    }

    const currentUser = JSON.parse(storedUser);
    const currentUserId = currentUser.uid;

    const updatedComments = comments.map((c) => {
      if (c.id === commentId) {
        const likes = c.likes || [];
        const newLikes = likes.includes(currentUserId)
          ? likes.filter((uid) => uid !== currentUserId)
          : [...likes, currentUserId];
        return { ...c, likes: newLikes };
      }
      return c;
    });

    const commentToUpdate = updatedComments.find((c) => c.id === commentId);
    updateObject("comments", commentId, { likes: commentToUpdate.likes })
      .then(() => {
        setComments(updatedComments);
      })
      .catch((err) => console.error("Error updating like:", err));
  };

  return (
    <div
      className="bg-black w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <Navbar />
      {/* Search Bar */}
      <div className="flex items-center justify-center w-full mt-2 max-w-2xl mx-auto">
        <input
          type="text"
          dir="rtl"
          placeholder="חפש חייל/ת..."
          className="w-full rounded-lg py-2 pr-3 pl-10 text-black text-lg"
        />
        <Image
          src={"/search.svg"}
          alt="search"
          width={22}
          height={22}
          className="-mr-8"
        />
      </div>
      {/* Soldier Info */}
      <div className="max-w-3xl mx-auto text-center mt-6">
        <p className="text-[40px] leading-[40px] font-extralight">
          {soldier.darga} {soldier.name}
        </p>
        <Image
          src={soldier?.images?.[0] || "/fallback.png"}
          alt="soldier"
          width={500}
          height={550}
          className="w-full h-auto object-cover rounded-lg mt-4"
        />
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
          {(soldier.images || []).map((image, index) => (
            <div key={index} className="w-[47%]">
              <Image
                src={image}
                alt="image"
                width={1000}
                height={1000}
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Comments Section */}
      <div className="max-w-3xl mx-auto mt-8">
        <p className="text-[30px]">תגובות</p>
        <hr className="w-[50%] mt-1 mb-4" />
        {sortedComments.length > 0 ? (
          sortedComments.map((c, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-lg mb-4 relative"
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
            </div>
          ))
        ) : (
          <p className="text-lg">אין תגובות עדיין.</p>
        )}
      </div>
      {/* Comments Form */}
      <div className="max-w-3xl mx-auto mt-8">
        <form
          onSubmit={handleCommentSubmit}
          onChange={handleCommentChange}
          className="w-full bg-black p-6 rounded-lg shadow-lg"
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
      <Footer />
    </div>
  );
};

export default Page;
