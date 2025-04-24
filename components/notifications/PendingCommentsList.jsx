import React from "react";

const PendingCommentsList = ({
  pendingComments,
  handleCommentApproval,
  showComments,
}) => {
  if (!showComments) return null;

  return pendingComments.length === 0 ? (
    <p className="text-lg mb-8">אין תגובות ממתינות לאישור</p>
  ) : (
    <div className="mb-8">
      {pendingComments.map((comment, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4 relative">
          <p className="text-sm text-gray-400">
            תגובה לחייל: {comment.soldierName}
          </p>
          <p className="text-lg font-semibold mt-2">{comment.author}</p>
          <p className="mt-2 mb-10">{comment.message}</p>
          <div className="flex gap-4 mt-4 absolute left-2 bottom-2">
            <button
              onClick={() => handleCommentApproval(comment.id, true)}
              className="bg-green-600 px-4 py-1 rounded-lg hover:bg-green-700"
            >
              ✓
            </button>
            <button
              onClick={() => handleCommentApproval(comment.id, false)}
              className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
            >
              ✗
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingCommentsList;
