"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
// import { useUserStore } from "@/app/store/user.store";
import { useRouter } from "next/navigation";
const onboardingData = [
    {
        title: "Discover Nearby Events",
        description: "Find micro-events happening around you. From workshops to community gatherings, explore what's nearby.",
        image: (
            <Image src="/illustration/on-boarding-1.png" alt="on-boarding-1" width={300} height={300} />
        )
    },
    {
        title: "AI-Verified & Trusted",
        description: "Every event is verified through our AI-powered trust system. Join with confidence.",
        image: (
            <Image src="/illustration/on-boarding-2.png" alt="on-boarding-2" width={300} height={300} />
        )
    },
    {
        title: "Join, Host, Volunteer",
        description: "Participate as an attendee, volunteer, or host your own events. Build your community.",
        image: (
            <Image src="/illustration/on-boarding-3.png" alt="on-boarding-3" width={300} height={300} />
        )
    }
];



export default function OnboardingPage() {
    // const { user, isHydrated } = useUserStore()
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < onboardingData.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            router.replace("/SignIn");
        }
    };


    return (
        <div className="min-h-screen w-full max-w-[430px] mx-auto flex flex-col items-center bg-white p-6 relative overflow-x-hidden">
            {/* Top Navigation */}
            <button onClick={() => router.replace("/SignIn")} className="absolute top-8 right-8 text-[#8E9AAF] font-medium">Skip</button>

            {/* Dynamic Image Area */}
            <div className="flex-1 flex items-center justify-center">
                {onboardingData[currentStep].image}
            </div>

            {/* Content Section */}
            <div className="w-full max-w-sm flex flex-col items-center">
                <h1 className="text-3xl font-bold text-[#2D3344] text-center leading-tight transition-all duration-300">
                    {onboardingData[currentStep].title}
                </h1>
                <p className="text-[#8E9AAF] mt-4 text-center leading-relaxed">
                    {onboardingData[currentStep].description}
                </p>

                {/* Carousel Indicators (The Dots) */}
                <div className="flex space-x-2 mt-8">
                    {onboardingData.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2.5 rounded-full transition-all duration-300 ${currentStep === idx ? "w-8 bg-[#EF835D]" : "w-2.5 bg-[#F2EDE4]"
                                }`}
                        />
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNext}
                    className="w-full bg-[#EF835D] text-white py-4 rounded-2xl mt-10 font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                >
                    <span>{currentStep === onboardingData.length - 1 ? "Get Started" : "Continue"}</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}