"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("he-IL", options);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <p className="text-[30px]">תגובות</p>
      <hr className="w-[50%] mt-1 mb-4" />
      {sortedComments.length > 0 ? (
        <>
          {displayedComments.map((c, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-3 rounded-lg mb-4 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <p className="text-sm text-gray-400 absolute top-4 left-2">
                {formatDate(c.createdAt)}
              </p>
              <p className="text-lg font-semibold">{c.author}</p>
              <p className="mt-2">{c.message}</p>
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <button
                  onClick={() => handleLikeComment(c.id)}
                  className="mr-1"
                >
                  <Image
                    src={`/heart-${
                      c.likes?.includes(user?.uid) ? "true" : "false"
                    }.svg`}
                    alt="like"
                    width={24}
                    height={24}
                    className={c.likes?.includes(user?.uid) ? "" : "invert"}
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
  );
};

export default ShowComments;
