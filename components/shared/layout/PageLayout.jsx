import React, { useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthContext } from "@/context/AuthContext";

const PageLayout = ({ children, className }) => {
  const { onLogout } = useContext(AuthContext);

  return (
    <div
      className={`bg-[rgb(25,25,25)] w-full min-h-screen h-full flex flex-col px-5 pt-[70px] text-white ${
        className || ""
      }`}
      dir="rtl"
    >
      <Navbar onLogout={onLogout} />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};

export default PageLayout;
