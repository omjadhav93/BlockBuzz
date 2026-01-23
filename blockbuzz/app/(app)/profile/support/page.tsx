import {
    Settings,
    Search,
    MessageCircle,
    FileText,
    LifeBuoy,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function SupportPage() {
    const categories = [
        { title: "General Help", icon: LifeBuoy, color: "bg-blue-100 text-blue-600" },
        { title: "Guides", icon: FileText, color: "bg-purple-100 text-purple-600" },
        { title: "Account", icon: Settings, color: "bg-orange-100 text-orange-600" },
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-sans">
            {/* Header */}
            <header className="p-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <Link href="/profile">
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <h1 className="text-2xl font-bold text-[#2D3344]">Support</h1>
            </header>

            <main className="px-6 space-y-6">
                {/* Search Bar - Profile Style */}
                <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <Input
                        className="h-14 pl-12 bg-white rounded-2xl border-slate-100 shadow-sm focus-visible:ring-[#EF835D]"
                        placeholder="Search for help..."
                    />
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                        <div
                            key={cat.title}
                            className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2 active:scale-95 transition"
                        >
                            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${cat.color}`}>
                                <cat.icon size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-[#2D3344] uppercase tracking-tight">
                                {cat.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* FAQs - Using the Profile Option List Style */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Common Questions</h2>
                    <div className="rounded-[1.5rem] overflow-hidden border border-slate-100 bg-white shadow-sm px-2">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-b border-slate-50 px-2">
                                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-[#2D3344]">
                                    How to verify my account?
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-500 pb-4">
                                    Go to Profile &gt; Settings and upload a valid ID. Verification typically takes 24-48 hours.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-none px-2">
                                <AccordionTrigger className="hover:no-underline py-4 font-semibold text-[#2D3344]">
                                    Contacting a volunteer?
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-500 pb-4">
                                    You can message verified volunteers directly through the event dashboard.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Contact CTA - Soft Card Style */}
                <div className="p-6 bg-[#F2EDE4] rounded-[2rem] flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <MessageCircle size={28} className="text-[#2D3344]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#2D3344] text-lg">Still need us?</h3>
                        <p className="text-sm text-slate-600">Our team is available 24/7 to help you out.</p>
                    </div>
                    <button className="w-full py-4 bg-[#2D3344] text-white font-bold rounded-2xl active:scale-[0.98] transition">
                        Chat with Support
                    </button>
                </div>

                <p className="text-xs text-center text-slate-400">
                    Version 2.0.4 • App Support
                </p>
            </main>
        </div>
    );
}