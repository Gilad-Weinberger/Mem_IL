import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children, onLogout, className }) => {
  return (
    <div
      className={`bg-[rgb(25,25,25)] w-full min-h-screen h-full px-5 pt-14 text-white ${
        className || ""
      }`}
      dir="rtl"
    >
      <Navbar onLogout={onLogout} />
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;
