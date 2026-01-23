import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
    id: string;
    name: string;
    email: string;
    isOrganizer: boolean;
    isVolunteer: boolean;
};

type UserStore = {
    user: User | null;
    isHydrated: boolean;

    setUser: (user: User | null) => void;
    markHydrated: () => void;
    clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            isHydrated: false,

            setUser: (user) => set({ user }),

            clearUser: () => set({ user: null }),

            markHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: "user-store",

            partialize: (state) => ({
                user: state.user,
            }),

            onRehydrateStorage: () => {
                return () => {
                    useUserStore.getState().markHydrated();
                };
            },
        }
    )
);
