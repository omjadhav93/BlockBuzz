"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Eye, EyeOff, MapPin, Mail, User, Lock, Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validation/login-schema";
import { z } from "zod";
import { useRouter } from 'next/navigation';
// import { useUserStore } from "@/app/store/user.store";

type LoginInput = z.infer<typeof loginSchema>;

export default function Login() {
    const router = useRouter();
    // const setUserData = useUserStore((state) => state.setUser);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<LoginInput>({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof LoginInput, string[]>>
    >({});

    const handleLogin = async () => {

        setLoading(true);
        const result = loginSchema.safeParse(user);

        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            return;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user)
            })

            const data = await response.json();
            console.log("data from login", data)
            if (data.success) {
                // setUserData(data.user);
                router.push("/homepage");
            }
        } catch (error) {

        } finally {
            setLoading(false);
            setUser({
                email: "",
                password: ""
            })
        }

    }

    return (
        <div className="flex flex-col space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Email */}
            <div className="space-y-1.5">
                <Label className="ml-1">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input
                        className={`pl-10 h-12 ${errors.email ? "border-red-500" : ""
                            }`}
                        value={user.email}
                        onChange={(e) => {
                            setUser({ ...user, email: e.target.value });
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
                        value={user.password}
                        onChange={(e) => {
                            setUser({ ...user, password: e.target.value });
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

            <Button onClick={handleLogin} className="h-12 bg-[#EF835D] hover:bg-[#EF833D]">
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    "Log In"
                )}
            </Button>

        </div>
    )
}