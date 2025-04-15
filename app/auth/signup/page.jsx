"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);
  const { loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      const user = res.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        status: "regular",
        createdAt: new Date().toISOString(),
      });

      sessionStorage.setItem("user", JSON.stringify(user));
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      const lastPage = sessionStorage.getItem("lastPage") || "/soldiers";
      router.push(lastPage);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        status: "regular",
        createdAt: new Date().toISOString(),
      });

      sessionStorage.setItem("user", JSON.stringify(user));
      const lastPage = sessionStorage.getItem("lastPage") || "/soldiers";
      router.push(lastPage);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
      </button>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-md"
        style={{ direction: "rtl" }}
      >
        <h2 className="mb-6 text-center text-3xl font-bold text-white">
          הרשמה
        </h2>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">אימייל</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="הכנס את האימייל שלך"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">סיסמה</label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="הכנס את הסיסמה שלך"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-gray-300">אשר סיסמה</label>
          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="אשר את הסיסמה שלך"
            className="w-full rounded bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="mb-5 text-center text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded bg-dark-blue p-3 font-semibold text-white hover:bg-darker-blue"
        >
          הרשמה
        </button>
        <button
          onClick={handleGoogleSignUp}
          type="button"
          className="mt-4 flex w-full items-center justify-center rounded border border-gray-600 p-3 font-semibold text-white hover:border-indigo-500"
        >
          <Image
            src="/google.svg"
            alt="Google icon"
            width={20}
            height={20}
            className="ml-2"
          />
          הרשמה עם גוגל
        </button>
        <p className="mt-4 text-center text-gray-400">
          כבר יש לך חשבון?{" "}
          <Link href="/auth/signin" className="text-indigo-500 hover:underline">
            התחבר
          </Link>
        </p>
      </form>
    </div>
  );
}
