import Link from "next/link";
import Image from "next/image";
import { rankToInitials } from "@/lib/functions/rankInitials";

const SoldierGrid = ({ soldiers, loading, error, onLoadMore, hasMore }) => {
  if (loading) {
    return <p className="text-center w-full text-lg">טוען חיילים...</p>;
  }

  if (error) {
    return (
      <p className="text-center w-full text-lg text-red-500">שגיאה בטעינה</p>
    );
  }

  if (soldiers.length === 0) {
    return <p className="text-center w-full text-lg">לא נמצאו חיילים</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {soldiers.map((soldier) => (
          <Link
            key={soldier.id}
            href={`/soldiers/${soldier.id}`}
            className="flex flex-col items-center cursor-pointer hover:opacity-80"
          >
            <Image
              src={soldier.images[0] || ""}
              alt="soldier-image"
              width={150}
              height={150}
              className="rounded-lg w-full h-40 object-cover"
              priority
            />
            <p className="mt-2 text-white text-lg md:text-xl">
              {rankToInitials(soldier.rank)} {soldier.name}
            </p>
          </Link>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
            onClick={onLoadMore}
          >
            טען עוד
          </button>
        </div>
      )}
    </>
  );
};

export default SoldierGrid;
