"use client";

import { motion } from "framer-motion";

const CommentCard = ({ key, comment, user, handleLikeComment=null }) => {
  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("he-IL", options);
  };

  const formatLikesCount = (count) => {
    if (!count) return 0;
    
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  return (
    <motion.div
        key={key}
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
            disabled={!handleLikeComment}
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
            <span>{c.likes ? formatLikesCount(c.likes.length) : 0}</span>
        </div>
    </motion.div>
  );
};

export default CommentCard;
