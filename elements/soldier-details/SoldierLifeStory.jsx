const SoldierLifeStory = ({ lifeStory }) => {
  return (
    <div className="max-w-3xl mx-auto mt-6">
      <p className="text-[30px]">סיפור חיים</p>
      <hr className="w-[50%] mt-1" />
      <p className="mt-2 text-lg">{lifeStory}</p>
    </div>
  );
};

export default SoldierLifeStory;
