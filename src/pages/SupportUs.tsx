import PublicHeader from "@/components/PublicHeader";
import TopRibbon from "@/components/TopRibbon";
import { IndianRupee, Heart, ShieldCheck, Zap, ArrowRight, HandHeart, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SupportUs = () => {
    const navigate = useNavigate();

    const reasons = [
        {
            icon: Heart,
            title: "Direct Impact",
            description: "Your contributions go directly toward community welfare and maintaining the legacy of Shri Guru Kottureshwara.",
            color: "text-red-500",
            bg: "bg-red-50"
        },
        {
            icon: ShieldCheck,
            title: "100% Transparency",
            description: "Every rupee is tracked. You can view our public live stats to see exactly how funds are being utilized.",
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            icon: Zap,
            title: "Legacy Preservation",
            description: "Supporting the trust ensures that our spiritual and cultural heritage is preserved for generations to come.",
            color: "text-orange-500",
            bg: "bg-orange-50"
        }
    ];

    const stats = [
        { label: "Community Support", value: "24/7", icon: HandHeart },
        { label: "Active Volunteers", value: "50+", icon: Users },
        { label: "Local Reach", value: "Kotturu", icon: Globe }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <TopRibbon />
            <PublicHeader />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <HandHeart className="h-4 w-4" /> Support Our Mission
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                        Your kindness can change lives.
                    </h1>
                    <p className="text-gray-600 text-xl leading-relaxed">
                        Join us in our mission to serve the community and preserve the sacred heritage of Kotturu. Every contribution, no matter the size, helps us grow.
                    </p>
                </div>

                {/* Reasons Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {reasons.map((reason, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-900/5 border border-gray-100 hover:scale-[1.02] transition-transform duration-300 group">
                            <div className={`p-4 ${reason.bg} ${reason.color} rounded-2xl w-fit mb-6 group-hover:rotate-6 transition-transform`}>
                                <reason.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                        </div>
                    ))}
                </div>

                {/* Bank Details Section - Premium Design */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-orange-900/10 border border-orange-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 grid lg:grid-cols-2">
                        <div className="p-8 md:p-16 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900">Make a Donation</h2>
                                <p className="text-gray-600 text-lg">
                                    You can support us via Direct Bank Transfer or by scanning the UPI QR code. A receipt will be generated for every contribution.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Holder</p>
                                        <p className="font-black text-gray-800 text-lg uppercase leading-tight">P S SHRI GURU KOTTURESHWARA TRUST</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Number</p>
                                        <p className="font-black text-orange-600 text-2xl tracking-wider">50200103413256</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bank Name</p>
                                        <p className="font-black text-gray-800 text-lg">HDFC BANK, KOTTURU</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">IFSC Code</p>
                                        <p className="font-black text-gray-800 text-2xl tracking-widest">HDFC0005425</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button onClick={() => navigate("/public-data")} variant="outline" className="h-14 px-8 rounded-2xl border-orange-200 text-orange-700 font-bold hover:bg-orange-50 text-lg gap-2">
                                    View Live Stats <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-orange-600 p-8 md:p-16 flex flex-col items-center justify-center text-white space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold">Fast & Secure UPI</h3>
                                <p className="text-orange-100">Scan using any UPI app to donate instantly</p>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative group">
                                <img
                                    src="/qr-code.png"
                                    alt="Payment QR Code"
                                    className="w-56 h-56 md:w-64 md:h-64"
                                />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-orange-600 font-bold text-xs shadow-lg flex items-center gap-1 border border-orange-100">
                                    <ShieldCheck className="h-3 w-3" /> Secure Payment
                                </div>
                            </div>

                            <img src="/Logo.jpeg" alt="Trust Logo" className="h-24 w-24 object-contain rounded-2xl p-1 bg-white/10" />
                        </div>
                    </div>
                </div>

                {/* Minor Stats / Trust Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-800 leading-none mb-1">{stat.value}</p>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 text-center space-y-4">
                <img src="/Logo.jpeg" alt="Logo" className="h-12 w-12 mx-auto grayscale opacity-50" />
                <p className="text-gray-400 text-sm font-medium">P S SHRI GURU KOTTURESHWARA TRUST © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default SupportUs;
