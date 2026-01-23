import {
    ShieldCheck,
    Lock,
    Eye,
    ArrowLeft,
    FileLock,
    Database,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function PrivacyPage() {
    const highlights = [
        { title: "No Selling", icon: Eye, color: "bg-blue-100 text-blue-600" },
        { title: "Encrypted", icon: Lock, color: "bg-green-100 text-green-600" },
        { title: "GDPR Ready", icon: ShieldCheck, color: "bg-orange-100 text-orange-600" },
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-sans">
            {/* Header - Matching Profile Style */}
            <header className="p-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <Link href="/profile">
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <h1 className="text-2xl font-bold text-[#2D3344]">Privacy Policy</h1>
            </header>

            <main className="px-6 space-y-6">
                {/* Intro Card */}
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-2">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#F2EDE4] rounded-2xl mb-4">
                        <FileLock size={24} className="text-[#2D3344]" />
                    </div>
                    <h2 className="text-xl font-bold text-[#2D3344] mb-2">Your Privacy Matters</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        We use industry-standard encryption to ensure your data stays yours.
                        Below is a breakdown of how we handle your information.
                    </p>
                </div>

                {/* Highlight Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {highlights.map((item) => (
                        <div
                            key={item.title}
                            className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2"
                        >
                            <div className={`w-11 h-11 flex items-center justify-center rounded-2xl ${item.color}`}>
                                <item.icon size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-[#2D3344] uppercase tracking-tight">
                                {item.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Detailed Sections - Using your Option List Style */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Data Governance</h2>
                    <div className="rounded-[1.5rem] overflow-hidden border border-slate-100 bg-white shadow-sm px-2">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="data-collection" className="border-b border-slate-50 px-2">
                                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-[#2D3344]">
                                    1. Data Collection
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-500 pb-4 leading-relaxed">
                                    We collect your name, email, and basic device metrics to provide a stable experience. We do not track your location without explicit permission.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="data-usage" className="border-b border-slate-50 px-2">
                                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-[#2D3344]">
                                    2. Data Usage
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-500 pb-4 leading-relaxed">
                                    Information is used strictly for account management, security alerts, and improving app performance. We never share your personal details with advertisers.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="data-security" className="border-none px-2">
                                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-[#2D3344]">
                                    3. Security Protocols
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-500 pb-4 leading-relaxed">
                                    Your data is stored in encrypted databases using AES-256 standards. Our servers are located in secure facilities with 24/7 monitoring.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Data Rights Card */}
                <div className="flex items-center gap-4 p-4 bg-[#F2EDE4] rounded-2xl border border-amber-100/50">
                    <div className="w-11 h-11 flex items-center justify-center bg-white rounded-2xl shrink-0">
                        <Database size={22} className="text-[#2D3344]" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-[#2D3344] text-sm tracking-tight">Request Your Data</h4>
                        <p className="text-[11px] text-slate-600">Download or delete your data anytime.</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                </div>

                {/* Compliance Footer */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        Effective Jan 2026
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                        Compliant with global privacy standards including GDPR and CCPA.
                    </p>
                </div>
            </main>
        </div>
    );
}