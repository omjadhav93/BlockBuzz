"use client";
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
// import { useUserStore } from "./store/user.store";
import { useRouter } from "next/navigation";

export default function LoadingScreen() {
  // const { user, isHydrated } = useUserStore()
  const router = useRouter();
  const [showDots, setShowDots] = useState(false);

  // useEffect(() => {
  // if (!isHydrated) return;

  const dotsTimer = setTimeout(() => {
    setShowDots(true);
    router.replace("/onboarding")
  }, 1500);

  // if (user) {
  //     router.replace("/homepage")
  //   } else {
  //     router.replace("/onboarding")
  //   }
  // }, [user, isHydrated, router]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#EF835D]/10 rounded-2xl animate-box-wave" />
        <div className="relative z-10 flex items-center justify-center bg-orange-50 p-6 rounded-2xl shadow-sm">
          <Sparkles size={44} className="text-[#EF835D] animate-pulse" />
        </div>
      </div>

      <div className="mt-8 text-center animate-in fade-in duration-700">
        <h1 className="text-3xl font-bold text-slate-800">BlockBuzz</h1>
        <p className="text-slate-500 mt-2 font-medium">Never miss what’s buzzing nearby</p>
      </div>

      <div className="fixed bottom-20 h-10">
        {showDots && (
          <div className="flex space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-3 h-3 rounded-full bg-[#EF835D] animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-[#EF835D] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 rounded-full bg-[#EF835D] animate-bounce [animation-delay:-0.3s]" />
          </div>
        )}
      </div>
    </div>
  );
}