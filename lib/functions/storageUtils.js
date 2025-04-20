import { storage } from "@/lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a single file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path where the file should be stored (default: "soldiers")
 * @returns {Promise<{url: string, path: string}>} - The download URL and storage path
 */
export const uploadFile = async (file, folder = "soldiers") => {
  try {
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      url: downloadURL,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Uploads multiple files to Firebase Storage
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - The folder path where the files should be stored (default: "soldiers")
 * @returns {Promise<Array<{url: string, path: string}>>} - Array of download URLs and storage paths
 */
export const uploadMultipleFiles = async (files, folder = "soldiers") => {
  try {
    const uploadPromises = Array.from(files).map((file) =>
      uploadFile(file, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw new Error("Failed to upload files");
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
};

/**
 * Deletes multiple files from Firebase Storage
 * @param {string[]} filePaths - Array of file paths to delete
 * @returns {Promise<void>}
 */
export const deleteMultipleFiles = async (filePaths) => {
  try {
    const deletePromises = filePaths.map((path) => deleteFile(path));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple files:", error);
    throw new Error("Failed to delete files");
  }
};
