"use client";
import { Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Register from "@/components/app/Register";
import Login from "@/components/app/Login";


export default function SignIn() {

    return (
        /* Removed w-screen to prevent overflow; used max-w for better mobile scaling */
        <div className="min-h-screen w-full max-w-md mx-auto flex flex-col pt-20 bg-white p-6">

            {/* Logo Section */}
            <div className="flex items-center justify-center mb-6 gap-3">
                <div className="flex items-center justify-center bg-[#FDF2ED] p-2.5 rounded-2xl shadow-sm">
                    <Sparkles size={24} className="text-[#EF835D]" />
                </div>
                <h1 className="text-2xl text-[#2D3344] font-bold tracking-tight">BlockBuzz</h1>
            </div>

            {/* <div className="mt-8 mb-6">
                <h2 className="text-3xl font-bold text-[#2D3344]">Welcome back</h2>
                <p className="text-[#8E9AAF] mt-1">Sign in to discover events near you</p>
            </div> */}

            {/* Tabs Section */}
            <Tabs className="w-full mt-4" defaultValue="register">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-[#F2EDE4]/50 p-1">
                    <TabsTrigger
                        value="register"
                        className="rounded-lg text-lg data-[state=active]:bg-white data-[state=active]:text-[#EF835D] data-[state=active]:shadow-sm"
                    >
                        Register
                    </TabsTrigger>
                    <TabsTrigger
                        value="login"
                        className="rounded-lg text-lg data-[state=active]:bg-white data-[state=active]:text-[#EF835D] data-[state=active]:shadow-sm"
                    >
                        Login
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="register" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Register />
                </TabsContent>

                <TabsContent value="login" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Login />
                </TabsContent>
            </Tabs>
        </div>
    )
}