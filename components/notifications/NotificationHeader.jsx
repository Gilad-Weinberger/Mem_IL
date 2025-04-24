import React from "react";
import Image from "next/image";

const NotificationHeader = ({
  title,
  hasItems,
  isShowing,
  toggleSection,
  section,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl">{title}</h1>
      {hasItems && (
        <button
          onClick={() => toggleSection(section)}
          className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
        >
          <Image
            src="/previous.svg"
            alt="Toggle"
            width={20}
            height={20}
            className={`transform transition-transform ${isShowing ? "rotate-90" : "-rotate-90"}`}
          />
        </button>
      )}
    </div>
  );
};

export default NotificationHeader;
