import React from "react";

const ImageUpload = ({ images, onImageChange, onImageDelete, error }) => {
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
          onChange={onImageChange}
          className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {error && <p className="text-red-500 text-right mt-1">{error}</p>}
      </div>
      <div className="flex flex-wrap mb-4">
        {images &&
          images.map((image, index) => (
            <div key={index} className="relative m-2">
              <img
                src={image}
                alt={`uploaded ${index}`}
                className="w-24 h-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => onImageDelete(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full py-0.5 px-1.5 text-[15px]"
              >
                &#x1F5D1;
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

export default ImageUpload;
