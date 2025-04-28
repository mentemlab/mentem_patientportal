"use client";

import React from "react";
import { ArrowRightToLineIcon, UploadIcon } from "lucide-react";
import { useAppContext } from "@/context/useAppContext";

const Navbar = () => {
  const { toggleSidebar } = useAppContext();
  return (
    <React.Fragment>
      <div className="hidden sm:flex fixed top-2 rounded-t-sm right-2 left-72 px-4 justify-between items-center h-14 border-b-2 border-[#EAEDEF] bg-white">
        <div></div>
        <button className="h-8 w-fit border px-3 text-sm border-black rounded-xs flex items-center justify-center">
          <UploadIcon size={14} className="me-2" />
          Share
        </button>
      </div>
      <div className="sm:hidden fixed top-0 left-0 right-0 flex justify-center h-16">
        <div className="w-full flex items-center justify-between p-2 sm:border-x shadow-md bg-white">
          <button
            onClick={toggleSidebar}
            className="h-8 w-8 flex items-center justify-center"
          >
            <ArrowRightToLineIcon size={20} />
          </button>
          <h1 className="text-2xl font-light">MENTEM</h1>

          <button className="h-8 w-8 flex items-center justify-center">
            <UploadIcon size={18} />
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Navbar;
