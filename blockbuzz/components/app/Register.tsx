"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Eye, EyeOff, MapPin, Mail, User2, Lock, Loader2 } from "lucide-react";
import { registerSchema } from "@/lib/validation/register-schema";
import { z } from "zod";
import { useRouter } from "next/navigation";
// import { useUserStore, User } from "@/app/store/user.store";

type RegisterInput = z.infer<typeof registerSchema>;

export default function Register() {
    const router = useRouter()
    // const setUser = useUserStore((state) => state.setUser);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState<RegisterInput>({
        name: "",
        email: "",
        password: "",
        location: "",
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof RegisterInput, string[]>>
    >({});

    // const { setUser } = useUserStore()

    const handleRegister = async () => {
        setLoading(true);
        // const result = registerSchema.safeParse(userData);

        // if (!result.success) {
        //     setErrors(result.error.flatten().fieldErrors);
        //     return;
        // }

        // try {
        //     const response = await fetch("/api/auth/register", {
        //         method: "POST",
        //         headers: {
        //             contentTypes: "application/json",
        //         },
        //         body: JSON.stringify(userData)
        //     })

        //     const data = await response.json();
        //     if (data.success) {
        //         setUserData(data.user);
        //         router.push("/add-interest")
        //     }
        // } catch (error) {
        //     console.log(error)
        // } finally {
        //     setLoading(false);
        //     setUserData({
        //         name: "",
        //         email: "",
        //         password: "",
        //         location: "",
        //     })
        // }
    };

    return (
        <div className="flex flex-col space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Name */}
            <div className="space-y-1.5">
                <Label className="ml-1">Full Name</Label>
                <div className="relative">
                    <User2 className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input
                        className={`pl-10 h-12 ${errors.name ? "border-red-500" : ""
                            }`}
                        value={userData.name}
                        onChange={(e) => {
                            setUserData({ ...userData, name: e.target.value });
                            setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="John Doe"
                    />
                </div>
                {errors.name && (
                    <p className="text-xs text-red-500 ml-1">{errors.name[0]}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <Label className="ml-1">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input
                        className={`pl-10 h-12 ${errors.email ? "border-red-500" : ""
                            }`}
                        value={userData.email}
                        onChange={(e) => {
                            setUserData({ ...userData, email: e.target.value });
                            setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="johndoe@mail.com"
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-red-500 ml-1">{errors.email[0]}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <Label className="ml-1">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input
                        className={`pl-10 pr-10 h-12 ${errors.password ? "border-red-500" : ""
                            }`}
                        type={showPassword ? "text" : "password"}
                        value={userData.password}
                        onChange={(e) => {
                            setUserData({ ...userData, password: e.target.value });
                            setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs text-red-500 ml-1">{errors.password[0]}</p>
                )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
                <Label className="ml-1">Location</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input
                        className={`pl-10 h-12 ${errors.location ? "border-red-500" : ""
                            }`}
                        value={userData.location}
                        onChange={(e) => {
                            setUserData({ ...userData, location: e.target.value });
                            setErrors((prev) => ({ ...prev, location: undefined }));
                        }}
                        placeholder="Vadodara, India"
                    />
                </div>
                {errors.location && (
                    <p className="text-xs text-red-500 ml-1">{errors.location[0]}</p>
                )}
            </div>

            <Button onClick={handleRegister} className="h-12 bg-[#EF835D] hover:bg-[#EF833D]">
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    "Create Account"
                )}
            </Button>

        </div>
    );
}
