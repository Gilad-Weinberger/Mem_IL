import React from "react";

const StatusRequestsList = ({
  pendingStatusRequests,
  handleStatusRequestApproval,
  showRequests,
}) => {
  if (!showRequests) return null;

  return pendingStatusRequests.length === 0 ? (
    <p className="text-lg">אין בקשות סטטוס ממתינות לאישור</p>
  ) : (
    pendingStatusRequests.map((request, index) => (
      <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4 relative">
        <p className="text-lg font-semibold mt-2">{request.userEmail}</p>
        <p className="text-lg font-semibold mb-1">שם מלא: {request.fullName}</p>
        {request.soldierName && (
          <p className="text-md text-gray-400">חייל: {request.soldierName}</p>
        )}
        {request.relation && (
          <p className="text-md text-gray-400">קשר לחייל: {request.relation}</p>
        )}
        <div className="flex gap-4 mt-4 absolute left-2 bottom-2">
          <button
            onClick={() =>
              handleStatusRequestApproval(request.id, request.userId, true)
            }
            className="bg-green-600 px-4 py-1 rounded-lg hover:bg-green-700"
          >
            ✓
          </button>
          <button
            onClick={() =>
              handleStatusRequestApproval(request.id, request.userId, false)
            }
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
          >
            ✗
          </button>
        </div>
      </div>
    ))
  );
};

export default StatusRequestsList;
