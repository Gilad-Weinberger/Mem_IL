import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const SoldierImages = ({ images }) => {
  const [imageLimit, setImageLimit] = useState(2); // Limit for displayed images
  const [showHideImagesButton, setShowHideImagesButton] = useState(false);

  const handleShowMoreImages = () => {
    setImageLimit((prev) => prev + 2);
  };

  const handleHideImages = () => {
    setImageLimit(2);
    setShowHideImagesButton(false);
  };

  // Extract the image URL from the image object or use direct URL string
  const getImageUrl = (image) => {
    if (!image) return null;
    return typeof image === "string" ? image : image.url || null;
  };

  // If no images or empty array, show a message
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <p className="text-[30px]">תמונות</p>
      <hr className="w-[50%] mt-1" />
      <div className="flex flex-wrap justify-between gap-4 mt-3">
        {(images || []).slice(0, imageLimit).map((image, index) => {
          const imageUrl = getImageUrl(image);
          if (!imageUrl) return null; // Skip images with no URL

          return (
            <motion.div
              key={index}
              className="w-[47%] cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Image
                src={imageUrl}
                alt="image"
                width={1000}
                height={1000}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
            </motion.div>
          );
        })}
      </div>
      {images && imageLimit < images.length && (
        <button
          onClick={() => {
            handleShowMoreImages();
            setShowHideImagesButton(true);
          }}
          className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-4"
        >
          הצג עוד
        </button>
      )}
      {showHideImagesButton && (
        <button
          onClick={handleHideImages}
          className="w-full py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 mt-2"
        >
          הסתר
        </button>
      )}
    </div>
  );
};

export default SoldierImages;
