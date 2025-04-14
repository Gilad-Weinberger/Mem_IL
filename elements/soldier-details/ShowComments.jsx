"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import CommentCard from "./CommentCard";

const ShowComments = ({ comments, user, handleLikeComment }) => {
  const [commentLimit, setCommentLimit] = useState(3);
  const [showHideButton, setShowHideButton] = useState(false);

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

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <p className="text-[30px]">תגובות</p>
      <hr className="w-[50%] mt-1 mb-4" />
      {sortedComments.length > 0 ? (
        <>
          {displayedComments.map((c, index) => (
            <CommentCard 
              key={index}
              comment={c}
              user={user}
              handleLikeComment={handleLikeComment}
            />
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
  );
};

export default ShowComments;
