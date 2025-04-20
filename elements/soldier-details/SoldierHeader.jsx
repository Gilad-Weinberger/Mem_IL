import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { rankToInitials } from "@/lib/functions/rankInitials";

const SoldierHeader = ({ soldier, handleShare, handleQRClick, id }) => {
  const { user } = useAuth();

  // Extract image URL for the first image
  const getMainImageUrl = () => {
    if (!soldier.images || soldier.images.length === 0) {
      return null; // Return null instead of empty string for no image
    }

    const firstImage = soldier.images[0];
    // Handle both string format and object format for images
    return typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || null;
  };

  return (
    <div className="max-w-3xl mx-auto text-center mt-6">
      <p className="text-[40px] mt-1 leading-[40px] font-extralight">
        {rankToInitials(soldier.rank)} {soldier.name}
      </p>

      {/* Only render the Image component if we have a valid image source */}
      {getMainImageUrl() ? (
        <Image
          src={getMainImageUrl()}
          alt="soldier"
          width={300}
          height={330}
          priority={true}
          className="w-full sm:w-[60%] md:w-[55%] h-auto object-cover rounded-lg mx-auto mt-3"
        />
      ) : (
        <div className="w-full sm:w-[60%] md:w-[55%] h-[330px] bg-gray-700 rounded-lg mx-auto mt-3 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      )}

      <div className="flex flex-wrap item-center justify-center mt-5 gap-6">
        {soldier.instagram_link && (
          <Link href={soldier.instagram_link} target="_blank">
            <Image
              src={"/instagram.svg"}
              alt="instagram-icon"
              width={42}
              height={42}
              className="invert"
            />
          </Link>
        )}
        {soldier.facebook_link && (
          <Link href={soldier.facebook_link} target="">
            <Image
              src={"/facebook.svg"}
              alt="facebook-icon"
              width={42}
              height={42}
              className="invert"
            />
          </Link>
        )}
        {soldier.whatsapp_link && (
          <Link href={soldier.whatsapp_link} className="mt-0.5" target="_blank">
            <Image
              src={"/whatsapp.svg"}
              alt="whatsapp-icon"
              width={40}
              height={40}
              className="invert"
            />
          </Link>
        )}
        <button onClick={handleShare} className="mt-0.5">
          <Image
            src={"/share.svg"}
            alt="share-icon"
            width={40}
            height={40}
            className="invert"
          />
        </button>
        <button
          onClick={handleQRClick}
          className="bg-[rgb(25,25,25)] rounded-lg h-[42px] w-[42px] flex items-center justify-center"
        >
          <Image
            src="/qr.svg"
            alt="qr-icon"
            width={40}
            height={40}
            className=""
          />
        </button>
        {user && user.uid === soldier.createdBy && (
          <Link
            href={`/edit-soldier/${id}`}
            className="inline-block px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
          >
            ערוך חייל
          </Link>
        )}
      </div>
    </div>
  );
};

export default SoldierHeader;
