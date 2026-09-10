"use client";

import React from "react";
import { Car } from "lucide-react";

interface PageLoaderProps {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export default function PageLoader({
  text = "Chargement en cours...",
  subtext = "Veuillez patienter un instant",
  fullScreen = true,
}: PageLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    : "min-h-[300px] w-full flex items-center justify-center p-6";

  return (
    <div className={containerClasses}>
      <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-900/10 flex flex-col items-center max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Icon Container */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer glowing spinning ring */}
          <div className="w-20 h-20 rounded-full border-4 border-orange-100 border-t-orange-500 border-r-orange-500 animate-spin" />
          
          {/* Inner pulsating brand icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner animate-pulse">
              <Car size={24} className="transform -scale-x-100" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight mb-1">
          {text}
        </h3>
        
        {subtext && (
          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-[220px]">
            {subtext}
          </p>
        )}

        {/* Animated Loading Indicator Dots */}
        <div className="flex items-center gap-1.5 mt-5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
