"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CommentCard = ({
  comment,
  user,
  handleLikeComment = null,
  index = 0,
  showSoldierName = false, // New prop to control whether to show the soldier name
}) => {
  const router = useRouter();

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
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count;
  };

  const navigateToSoldier = () => {
    if (comment.soldierId) {
      router.push(`/soldiers/${comment.soldierId}`);
    }
  };

  return (
    <motion.div
      className="bg-gray-800 p-3 rounded-lg mb-4 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <p className="text-sm text-gray-400 absolute top-4 left-2">
        {formatDate(comment.createdAt)}
      </p>
      <p className="text-lg font-semibold">{comment.author}</p>
      {showSoldierName && comment.soldierName && (
        <div className="mt-1 mb-2">
          <span
            className="text-sm"
          >
            נכתב על <span className="text-blue-400 cursor-pointer" onClick={navigateToSoldier}>{comment.soldierName}</span>
          </span>
        </div>
      )}
      <p className="mt-2">{comment.message}</p>
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <button
          disabled={!handleLikeComment}
          onClick={() => handleLikeComment && handleLikeComment(comment.id)}
          className="mr-1"
        >
          <Image
            src={`/heart-${
              comment.likes?.includes(user?.uid) ? "true" : "false"
            }.svg`}
            alt="like"
            width={24}
            height={24}
            className={comment.likes?.includes(user?.uid) ? "" : "invert"}
          />
        </button>
        <span>
          {comment.likes ? formatLikesCount(comment.likes.length) : 0}
        </span>
      </div>
    </motion.div>
  );
};

export default CommentCard;
