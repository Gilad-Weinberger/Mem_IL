import { useState } from "react";

const SoldierLifeStory = ({ lifeStory }) => {
  const [showFullStory, setShowFullStory] = useState(false);
  const charLimit = 300;
  const isTextLong = lifeStory && lifeStory.length > charLimit;

  const toggleShowMore = () => {
    setShowFullStory(!showFullStory);
  };

  const displayText =
    isTextLong && !showFullStory
      ? `${lifeStory.substring(0, charLimit)}...`
      : lifeStory;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <p className="text-[30px]">סיפור חיים</p>
      <hr className="w-[50%] mt-1" />
      <p className="mt-2 text-lg">{displayText}</p>
      {isTextLong && (
        <button
          onClick={toggleShowMore}
          className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-4"
        >
          {showFullStory ? "הצג פחות" : "הצג יותר"}
        </button>
      )}
    </div>
  );
};

export default SoldierLifeStory;
