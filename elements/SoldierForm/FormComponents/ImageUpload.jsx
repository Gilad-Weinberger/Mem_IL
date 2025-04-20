import React, { useState } from "react";

const ImageUpload = ({ images, onImageChange, onImageDelete, error }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setUploading(true);
      onImageChange(e);
      setUploading(false);
    }
  };

  // Get appropriate image source for previews
  const getImageSource = (image) => {
    if (typeof image === "string") {
      return image || null;
    }
    return image?.url || null;
  };

  return (
    <>
      <div className="mb-4">
        <label
          htmlFor="images"
          className="block text-gray-300 mb-2 float-right"
        >
          :תמונות
        </label>
        <input
          type="file"
          id="images"
          name="images"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={uploading}
        />
        {uploading && (
          <p className="text-yellow-500 text-right mt-1">מעלה תמונות...</p>
        )}
        {error && <p className="text-red-500 text-right mt-1">{error}</p>}
      </div>

      {/* Image previews */}
      {images && images.length > 0 && (
        <div className="mt-4 mb-6">
          <p className="text-gray-300 text-right mb-2">תצוגה מקדימה:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => {
              const imageUrl = getImageSource(image);
              if (!imageUrl) return null; // Skip invalid images

              return (
                <div key={index} className="relative group">
                  <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-700">
                    <img
                      src={imageUrl}
                      alt={`uploaded ${index}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onImageDelete(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                    aria-label="Delete image"
                  >
                    &#x1F5D1;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUpload;
