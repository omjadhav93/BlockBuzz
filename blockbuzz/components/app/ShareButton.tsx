"use client";

import { useState } from "react";
import {
    Share2,
    X,
    Copy,
    Linkedin,
    Twitter,
    MessageCircle,
    Send,
} from "lucide-react";

type ShareButtonProps = {
    title: string;
    description?: string;
    url?: string;
};

function truncate(text = "", length = 60) {
    return text.length > length
        ? text.slice(0, length).trim() + "..."
        : text;
}

export default function ShareButton({
    title,
    description = "",
    url = typeof window !== "undefined" ? window.location.href : "",
}: ShareButtonProps) {
    const [open, setOpen] = useState(false);

    const shareText = truncate(description);
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title} — ${shareText}`);

    async function handleShare() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: shareText,
                    url,
                });
                console.log("Shared successful");
            } catch {
                console.log("Share failed");
            } finally {
                setOpen(false);
            }
        } else {
            setOpen(true);
        }
    }

    async function copyLink() {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
    }

    return (
        <>
            {/* Share Button */}
            <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full border p-2 hover:bg-muted"
            >
                <Share2 size={18} />
            </button>

            {/* Fallback Share Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-xl bg-background p-4 mt-40 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Share Event</h3>
                            <button onClick={() => setOpen(false)}>
                                <X />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={copyLink}
                                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                            >
                                <Copy size={16} /> Copy Link
                            </button>

                            <a
                                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                                target="_blank"
                                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                            >
                                <MessageCircle size={16} /> WhatsApp
                            </a>

                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                                target="_blank"
                                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                            >
                                <Twitter size={16} /> X
                            </a>

                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                                target="_blank"
                                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                            >
                                <Linkedin size={16} /> LinkedIn
                            </a>

                            <a
                                href={`mailto:?subject=${encodeURIComponent(
                                    title
                                )}&body=${encodedText}%0A${encodedUrl}`}
                                className="flex items-center gap-2 rounded-lg border px-3 py-2 col-span-2"
                            >
                                <Send size={16} /> Email
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
