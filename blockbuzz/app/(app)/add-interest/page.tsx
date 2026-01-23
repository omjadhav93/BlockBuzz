"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import useSWR from "swr";
import { useRouter } from "next/navigation";

interface Interest {
    id: string | number;
    name: string;
}

const Interests: Interest[] = [
    { id: 1, name: "Technology" },
    { id: 2, name: "NGO" },
    { id: 3, name: "Education" },
    { id: 4, name: "Sports" },
    { id: 5, name: "Travel" },
    { id: 6, name: "Food" },
    { id: 7, name: "Fashion" },
    { id: 8, name: "Health" },
    { id: 9, name: "Music" },
    { id: 10, name: "Fitness" },
];

/* ---------------- Fetcher ---------------- */
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch interests");

    const json = await res.json();

    if (typeof window !== "undefined") {
        localStorage.setItem("interests", JSON.stringify(json.data ?? []));
    }

    return json;
};

/* ----------- Cached fallback ----------- */
const getCachedInterests = (): Interest[] => {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem("interests") || "[]");
    } catch {
        return [];
    }
};

export default function AddInterest() {
    const router = useRouter();

    // ✅ array of IDs only
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ---------------- SWR ---------------- */
    const { data, isLoading } = useSWR(
        "/api/interest/list",
        fetcher,
        {
            fallbackData: { data: getCachedInterests() },
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const interestList: Interest[] = data?.data?.slice(0, 10) || Interests;

    /* ------------- Toggle ------------- */
    const toggleInterest = (id: string) => {
        setError(null);

        setSelectedInterests((prev) =>
            prev.includes(id)
                ? prev.filter((i) => i !== id)
                : [...prev, id]
        );
    };

    /* ------------ Submit ------------ */
    const handleInterests = async () => {
        if (selectedInterests.length === 0) {
            setError("Please select at least one interest to continue.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // const res = await fetch("/api/user/interest/update", {
            //     method: "PATCH",
            //     headers: { "Content-Type": "application/json" },
            //     credentials: "include",
            //     body: JSON.stringify({
            //         interests: selectedInterests,
            //     }),
            // });

            // const result = await res.json();

            // if (!res.ok) {
            //     setError(result?.message || "Failed to save interests.");
            //     return;
            // }

            router.push("/homepage");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="relative min-h-screen px-8 pt-16 pb-32">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    What interests you?
                </h1>
                <p className="text-sm tracking-wide text-gray-500 mt-2 max-w-xs">
                    Select topics to personalize your event recommendations.
                </p>
            </header>

            {error && (
                <div className="mb-6 flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {isLoading ? (
                    [...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="h-9 rounded-full bg-gray-200 animate-pulse"
                            style={{
                                width: `${Math.floor(
                                    Math.random() * 40 + 80
                                )}px`,
                            }}
                        />
                    ))
                ) : (
                    interestList.map((item) => {
                        const id = String(item.id);
                        const isSelected = selectedInterests.includes(id);

                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                onClick={() => toggleInterest(id)}
                                className={`px-4 py-2 text-sm cursor-pointer border-2 transition-all
                                    ${isSelected
                                        ? "bg-[#F2EGE4] text-slate-800 border-slate-500"
                                        : "bg-[#F2EDE4] text-slate-800 border-transparent hover:border-[#eaddca]"
                                    }`}
                            >
                                {item.name}
                            </Badge>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-md border-t border-gray-100">
                <Button
                    type="button"
                    onClick={handleInterests}
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg font-semibold bg-[#EF835D] hover:bg-[#d97350] shadow-lg shadow-orange-200"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Start Exploring"
                    )}
                </Button>
            </div>
        </div>
    );
}
