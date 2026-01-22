"use client";

import React from "react";
import { ImageSlider } from "./ImageSlider";
import { FoxyoIcon } from "../FoxyoLogo/FoxyoIcon";

const ShowcaseSection: React.FC = () => {
  return (
    <div className="relative w-full flex-1 overflow-hidden flex flex-col items-center justify-center p-10 text-white">
      <div className="absolute inset-0 z-10  opacity-30 pointer-events-none" />

      <div className="relative flex flex-col justify-center items-center z-20 max-w-lg text-center mb-10">
        <h2 className="text-3xl xl:text-4xl font-bold font-suse leading-tight text-app-primary">
          Take Your Conversations to the Next Dimension!{" "}
        </h2>
        <FoxyoIcon width={150} height={150} />
        <p className="text-xl font-light font-suse text-slate-800 dark:text-orange-100">
          Foxyo is an innovative communicator designed for spontaneous meet-ups.{" "}
          <span className="text-app-primary font-bold">Join the foxes!</span>
        </p>
      </div>

      <div className="relative z-20 w-full max-w-xl">
        <ImageSlider />

        <div className="absolute left-0 top-0 bottom-0 w-10 z-30 pointer-events-none bg-linear-to-r from-[#cad5e2] dark:from-[#0f172b] to-transparent" />

        <div className="absolute right-0 top-0 bottom-0 w-10 z-30 pointer-events-none bg-linear-to-l from-[#cad5e2] dark:from-[#0f172b] to-transparent" />
      </div>
    </div>
  );
};

export default ShowcaseSection;
