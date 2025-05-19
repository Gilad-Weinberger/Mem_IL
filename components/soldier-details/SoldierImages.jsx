import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const SoldierImages = ({ images }) => {
  const [imageLimit, setImageLimit] = useState(2); // Changed initial limit to 2
  const [showHideImagesButton, setShowHideImagesButton] = useState(false);

  const handleShowMoreImages = () => {
    setImageLimit((prev) => prev + 4); // Increased increment to 4
  };

  const handleHideImages = () => {
    setImageLimit(2); // Reset to 2 images
    setShowHideImagesButton(false);
  };

  // Extract the image URL from the image object or use direct URL string
  const getImageUrl = (image) => {
    if (!image) return null;
    return typeof image === "string" ? image : image.url || null;
  };

  // If no images or empty array, show nothing
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 mb-10">
      <h3 className="text-[30px] font-semibold mb-2">תמונות</h3>
      <hr className="w-[50%] mb-6 border-gray-600" />

      <div className="grid grid-cols-2 gap-4">
        {(images || []).slice(0, imageLimit).map((image, index) => {
          const imageUrl = getImageUrl(image);
          if (!imageUrl) return null; // Skip images with no URL

          return (
            <motion.div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Image
                src={imageUrl}
                alt={`תמונה ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 mt-4">
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
    </div>
  );
};

export default SoldierImages;
