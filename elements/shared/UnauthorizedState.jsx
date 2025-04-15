import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const UnauthorizedState = ({ user, userStatus, message }) => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-8"
      dir="rtl"
    >
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded"
      >
        <Image src="/previous.svg" alt="Go Back" width={24} height={24} />
      </button>
      <p className="text-xl">{message}</p>
    </div>
  );
};

export default UnauthorizedState;
