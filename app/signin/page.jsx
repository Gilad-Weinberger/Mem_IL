"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const [user, setUser] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (res) {
        const user = res.user;
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (!userSnapshot.exists()) {
          await setDoc(userDoc, {
            email: user.email,
            status: "regular",
            createdAt: new Date().toISOString(),
          }); // Create user object in Firestore if not exists
        }

        sessionStorage.setItem("user", JSON.stringify(user));
        setEmail("");
        setPassword("");
        const lastPage = sessionStorage.getItem("lastPage") || "/soldiers";
        router.push(lastPage);
      } else {
        setError("פרטי התחברות שגויים.");
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res) {
        const user = res.user;
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (!userSnapshot.exists()) {
          await setDoc(userDoc, {
            email: user.email,
            status: "regular",
            createdAt: new Date().toISOString(),
          }); // Create user object in Firestore if not exists
        }

        sessionStorage.setItem("user", JSON.stringify(user));
        const lastPage = sessionStorage.getItem("lastPage") || "/soldiers";
        router.push(lastPage);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
      </button>
      <form
        onSubmit={handleEmailPasswordSignIn}
        className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-md text-right"
      >
        <h2 className="mb-6 text-center text-3xl font-bold text-white">
          התחברות
        </h2>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">אימייל</label>
          <input
            dir="rtl"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="הכנס את האימייל שלך"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-3">
          <label className="mb-2 block text-gray-300">סיסמה</label>
          <input
            dir="rtl"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="הכנס את הסיסמה שלך"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="mb-5 text-center text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-700"
        >
          התחבר
        </button>
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="mt-4 gap-2 flex w-full items-center justify-center rounded border border-gray-600 p-3 font-semibold text-white hover:border-indigo-500"
        >
          <Image
            src="/google.svg"
            alt="Google icon"
            width={20}
            height={20}
            className="ml-2"
          />
          התחבר עם גוגל
        </button>
        <p className="mt-4 text-center text-gray-400">
          אין לך חשבון?{" "}
          <Link href="/signup" className="text-indigo-500 hover:underline">
            הרשם
          </Link>
        </p>
      </form>
    </div>
  );
}
