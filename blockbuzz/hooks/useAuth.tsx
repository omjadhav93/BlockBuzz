"use client";

import { useEffect } from "react";
import { useUserStore } from "@/app/store/user.store";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const setUser = useUserStore((s) => s.setUser);
    const clearUser = useUserStore((s) => s.clearUser);
    const markHydrated = useUserStore((s) => s.markHydrated);

    useEffect(() => {
        const checkMe = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}api/auth/me`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    router.push("/SignIn")
                };

                const { user } = await res.json();
                setUser(user);
            } catch (error) {
                console.error("Auth check failed", error);
                clearUser();
            } finally {
                markHydrated();
            }
        };

        checkMe();
    }, []);

    return children;
}
