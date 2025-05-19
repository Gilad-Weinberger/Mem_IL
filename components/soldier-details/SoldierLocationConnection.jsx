import { useState } from "react";

const SoldierLocationConnection = ({ locationConnection }) => {
  const [showFullText, setShowFullText] = useState(false);
  const charLimit = 300;
  const isTextLong =
    locationConnection && locationConnection.length > charLimit;

  const toggleShowMore = () => {
    setShowFullText(!showFullText);
  };

  const displayText =
    isTextLong && !showFullText
      ? `${locationConnection.substring(0, charLimit)}...`
      : locationConnection;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <p className="text-[30px]">מקום אהוב</p>
      <hr className="w-[50%] mt-1" />

      {locationConnection ? (
        <>
          <p className="mt-2 text-lg">{displayText}</p>
          {isTextLong && (
            <button
              onClick={toggleShowMore}
              className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-4"
            >
              {showFullText ? "הצג פחות" : "הצג יותר"}
            </button>
          )}
        </>
      ) : (
        <p className="mt-2 text-lg text-gray-400">לא צוין מקום אהוב</p>
      )}
    </div>
  );
};

export default SoldierLocationConnection;
