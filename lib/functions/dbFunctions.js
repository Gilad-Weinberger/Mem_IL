import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export const getAllObjects = async (collectionName) => {
  const Collection = collection(db, collectionName);
  const Snapshot = await getDocs(Collection);
  const List = Snapshot.docs.map((doc) => doc.data());
  return List;
};

export const getObject = async (collectionName, id) => {
  const Collection = collection(db, collectionName);
  const Snapshot = await getDocs(Collection);
  const List = Snapshot.docs.map((doc) => doc.data());
  const Object = List.find((obj) => obj.id === id);
  return Object;
};

export const getObjectsByField = async (collectionName, field, value) => {
  const Collection = collection(db, collectionName);
  const Snapshot = await getDocs(Collection);
  const List = Snapshot.docs.map((doc) => doc.data());
  const Objects = List.filter((obj) => obj[field] === value);
  return Objects;
};

export const addObject = async (collectionName, object) => {
  const Collection = collection(db, collectionName);
  await Collection.add(object);
};

export const updateObject = async (collectionName, id, object) => {
  const Collection = collection(db, collectionName);
  await Collection.doc(id).update(object);
};

export const deleteObject = async (collectionName, id) => {
  const Collection = collection(db, collectionName);
  await Collection.doc(id).delete();
};
