"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  getObject,
  createObject,
  updateObject,
} from "@/lib/functions/dbFunctions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Page = () => {
  const [soldier, setSoldier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({
    author: "",
    message: "",
  });
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getObject("soldiers", id)
        .then((data) => {
          if (!data) {
            setError(new Error("לא נמצא חייל"));
          } else {
            setSoldier(data);
          }
        })
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

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

    const newComment = { ...comment, soldierId: id };
    createObject("comments", newComment)
      .then(() => {
        return updateObject("soldiers", id, {
          comments: [...(soldier.comments || []), newComment],
        });
      })
      .then(() => {
        setComment({ author: "", message: "" });
        setSoldier((prevSoldier) => ({
          ...prevSoldier,
          comments: [...(prevSoldier.comments || []), newComment],
        }));
      })
      .catch((error) => console.error("Error adding comment:", error));
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
        {soldier.comments && soldier.comments.length > 0 ? (
          soldier.comments.map((comment, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-lg font-semibold">{comment.author}</p>
              <p className="mt-2">{comment.message}</p>
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
