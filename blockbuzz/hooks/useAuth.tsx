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
                const res = await fetch("/api/user/me", {
                    credentials: "include",
                });

                if (!res.ok) {
                    router.push("/SignIn")
                };

                const { user } = await res.json();
                setUser(user);
            } catch {
                clearUser();
            } finally {
                markHydrated();
            }
        };

        checkMe();
    }, []);

    return children;
}
