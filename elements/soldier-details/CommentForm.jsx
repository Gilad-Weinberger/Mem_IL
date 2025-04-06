import { useState } from "react";
import { createObject } from "@/lib/functions/dbFunctions";

const CommentForm = ({ soldierId, user, onCommentSubmit, showLoginModal }) => {
  const [comment, setComment] = useState({
    author: "",
    message: "",
  });

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setComment((prevComment) => ({
      ...prevComment,
      [name]: value,
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      showLoginModal();
      return;
    }

    if (!comment.author.trim() || !comment.message.trim()) {
      alert("נא למלא את כל השדות!");
      return;
    }

    const newComment = {
      ...comment,
      soldierId,
      likes: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    createObject("comments", newComment)
      .then(() => {
        setComment({ author: "", message: "" });
        onCommentSubmit(newComment);
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <form
        onSubmit={handleCommentSubmit}
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
  );
};

export default CommentForm;
