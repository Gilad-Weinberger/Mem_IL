"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const Page = () => {
  return (
    <div
      className="bg-[rgb(25,25,25)] w-full min-h-screen h-full px-5 pt-14 text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="max-w-3xl mx-auto mt-8 text-center">
        <h1 className="text-4xl mb-6">ברוכים הבאים לאתר שלנו</h1>
        <p className="text-lg mb-6">כאן תוכלו למצוא מידע על כל החיילים</p>
        <Link
          href="/soldiers"
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          לכל החיילים
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
