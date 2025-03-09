import { db } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const getAllObjects = async (collectionName) => {
  const Collection = collection(db, collectionName);
  const Snapshot = await getDocs(Collection);
  const List = Snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return List;
};

export const getObject = async (collectionName, id) => {
  const Collection = collection(db, collectionName);
  const Snapshot = await getDocs(Collection);
  const List = Snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const Object = List.find((obj) => obj.id === id);
  return Object;
};

export const getObjectsByField = async (collectionName, field, value) => {
  const Collection = collection(db, collectionName);
  const Snapshot = await getDocs(Collection);
  const List = Snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const Objects = List.filter((obj) => obj[field] === value);
  return Objects;
};

export const createObject = async (collectionName, data) => {
  try {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, data);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateObject = async (collectionName, id, object) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, object);
    return { success: true };
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteObject = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
