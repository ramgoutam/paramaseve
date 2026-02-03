import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users, FileText, ArrowRight, IndianRupee, X } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopRibbon from "@/components/TopRibbon";
import PublicHeader from "@/components/PublicHeader";

const PublicDashboard = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({
        total_amount: 0,
        total_donations: 0,
        total_volunteers: 0,
        total_expenses: 0
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [emblaRef] = useEmblaCarousel({ loop: true });

    // New state for 2026 popup
    const [showStatsPopup, setShowStatsPopup] = useState(false);
    const [stats2026, setStats2026] = useState({
        total_amount: 0,
        total_expenses: 0,
        net_balance: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch Total Stats (Existing)
                const { data, error } = await supabase.rpc('get_public_stats');
                if (error) throw error;
                if (data) setStats(data);

                // 2. Fetch 2026 Specific Stats for Popup
                const startOf2026 = '2026-01-01T00:00:00';
                const endOf2026 = '2026-12-31T23:59:59';

                const { data: donations2026 } = await supabase
                    .from('donations')
                    .select('amount')
                    .gte('created_at', startOf2026)
                    .lte('created_at', endOf2026);

                const { data: expenses2026 } = await supabase
                    .from('expenses')
                    .select('amount')
                    .gte('expense_date', startOf2026)
                    .lte('expense_date', endOf2026);

                const totalDonations2026 = donations2026?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
                const totalExpenses2026 = expenses2026?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

                setStats2026({
                    total_amount: totalDonations2026,
                    total_expenses: totalExpenses2026,
                    net_balance: totalDonations2026 - totalExpenses2026
                });

                // Show popup after a delay
                setTimeout(() => {
                    setShowStatsPopup(true);
                }, 1500);

            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const videoItems = [
        { src: '/gallery/video-4.mp4', caption: 'Festival Highlights' },
        { src: '/gallery/video-3.mp4', caption: 'Procession Moments' },
        { src: '/gallery/video-2.mp4', caption: 'Community Event' },
        { src: '/gallery/video-1.mp4', caption: 'Temple Gathering' },
    ];

    const photoItems = Array.from({ length: 16 }).map((_, i) => ({
        src: `/gallery/photo-${i + 1}.jpg`,
        alt: `Community Moment ${i + 1}`,
        caption: `Gallery Photo ${i + 1}`
    }));

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <TopRibbon />
            <PublicHeader />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
                {/* Banner Section */}
                <div className="w-full flex-none shrink-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-white rounded-2xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden">
                        <img
                            src='/banner-kn.jpg'
                            alt="Trust Banner"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>

                {/* New Photo Slider Section */}
                <div className="w-full relative group animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
                    <div className="overflow-hidden rounded-[2.5rem] shadow-2xl shadow-orange-900/10 border border-gray-100" ref={emblaRef}>
                        <div className="flex">
                            {[
                                { src: '/12_banner.png', title: 'Special Seva', subtitle: 'Join us in our upcoming spiritual events' },
                            ].map((slide, index) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 relative bg-white">
                                    <img
                                        src={slide.src}
                                        alt={slide.title}
                                        className="w-full h-auto object-contain mx-auto"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thank You Section */}
                <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-px bg-orange-200 w-16 md:w-32"></div>
                        <h2 className="text-xl md:text-3xl font-black text-slate-800 text-center uppercase tracking-wide">
                            We are very Thankful to
                        </h2>
                        <div className="h-px bg-orange-200 w-16 md:w-32"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 w-full">
                        {[
                            "Group of YSS College Staff and Students",
                            "Kotturu/Kudligi Taluk Doctor's Association",
                            "Volunteers",
                            "Remaining Doctors and Medical Reps",
                            "We Are One Teachers Team (Tarle Cricketers)",
                            "Place Doner Sri Halesha",
                            "Cook Kotresh and Team",
                            "All Donars"
                        ].map((name, idx) => (
                            <div key={idx} className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-orange-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300 text-center flex items-center justify-center bg-gradient-to-br from-white to-orange-50/30">
                                <h3 className="font-bold text-gray-800 text-xs md:text-lg leading-relaxed tracking-tight">{name}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Make a Donation Section */}
                <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
                        {/* Left Side - Bank Details */}
                        <div className="flex-1 p-8 md:p-12 lg:p-16 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Make a Donation</h2>
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                                        <div className="h-4 w-4 text-blue-600 font-bold flex items-center justify-center">i</div>
                                    </div>
                                    <p className="text-gray-600 font-medium text-base leading-relaxed">
                                        <span className="text-blue-700 font-bold block mb-1">Note to Devotees</span>
                                        Donations are deeply appreciated but <span className="font-bold text-gray-800">purely voluntary and not mandatory</span>. You can support us via Direct Bank Transfer or by scanning the UPI QR code. A receipt will be generated for every contribution.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Holder</p>
                                        <p className="font-black text-gray-900 text-lg uppercase leading-tight">P S SHRI GURU KOTTURESHWARA TRUST</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Number</p>
                                        <p className="font-black text-orange-600 text-2xl font-mono tracking-wide">50200103413256</p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 w-full"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bank Name</p>
                                        <p className="font-black text-gray-900 text-lg uppercase">HDFC BANK, KOTTURU</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">IFSC Code</p>
                                        <p className="font-black text-slate-800 text-xl font-mono tracking-wider">HDFC0005425</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Button
                                    onClick={() => navigate('/public-data')}
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl border-2 border-orange-100 text-orange-700 font-bold text-lg hover:bg-orange-50 hover:border-orange-200 hover:text-orange-800 transition-all shadow-sm group"
                                >
                                    View Live Stats
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>

                        {/* Right Side - QR Code */}
                        <div className="lg:w-[45%] bg-[#ea580c] p-8 md:p-16 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <h3 className="text-2xl font-black text-white">Fast & Secure UPI</h3>
                                <p className="text-orange-100 font-medium">Scan using any UPI app to donate instantly</p>
                            </div>

                            <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl shadow-black/20 transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="/qr-code.png"
                                    alt="Donation QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                                <div className="mt-4 text-[10px] font-bold text-center text-gray-400 uppercase tracking-wider">
                                    P S SHRI GURU KOTTURESHWARA TRUST
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                                    <div className="bg-green-500 rounded-full p-1">
                                        <Users className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-white text-sm font-bold">Secure Payment</span>
                                </div>

                                <div className="bg-white p-2 rounded-xl shadow-lg">
                                    <img src="/Logo.jpeg" alt="Trust Logo" className="h-12 w-12 object-contain rounded-lg" />
                                </div>
                            </div>

                            {/* Decorative Background Circles */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 w-full mb-10">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-px bg-orange-200 w-16 md:w-32"></div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 text-center uppercase tracking-wide">Photo Gallery</h2>
                        <div className="h-px bg-orange-200 w-16 md:w-32"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
                        {photoItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedImage(item.src)}
                                className="group relative overflow-hidden rounded-2xl shadow-md border border-gray-100 bg-gray-100 aspect-square cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <img
                                    src={item.src}
                                    alt={item.alt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-px bg-orange-200 w-16 md:w-32"></div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 text-center uppercase tracking-wide">Video Highlights</h2>
                        <div className="h-px bg-orange-200 w-16 md:w-32"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videoItems.map((item, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-3xl shadow-lg border border-gray-100 bg-black aspect-video hover:bg-gray-900 transition-colors transform hover:scale-[1.01] duration-300">
                                <video
                                    src={item.src}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    controls
                                    playsInline
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>
                </div>

                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-none shadow-none flex justify-center items-center">
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Full view"
                                className="max-h-[90vh] w-auto rounded-lg shadow-2xl"
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* 2026 Stats Popup */}
                <Dialog open={showStatsPopup} onOpenChange={setShowStatsPopup}>
                    <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-0 overflow-hidden [&>button]:hidden">
                        <div className="relative bg-orange-600 p-6 flex flex-col items-center text-center">
                            <div className="p-3 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
                                <IndianRupee className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">2026 Financial Update</h2>
                            <p className="text-orange-100 font-medium">Transparency Report</p>

                            <button
                                onClick={() => setShowStatsPopup(false)}
                                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Collections</p>
                                    <p className="text-xl font-black text-gray-900">₹{stats2026.total_amount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center text-center">
                                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Expenses</p>
                                    <p className="text-xl font-black text-gray-900">₹{stats2026.total_expenses.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Net Balance</p>
                                    <p className="text-2xl font-black text-gray-900">₹{stats2026.net_balance.toLocaleString('en-IN')}</p>
                                </div>
                                <Button
                                    onClick={() => navigate('/public-data')}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20"
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>

            <footer className="bg-white border-t border-gray-100 pt-8 pb-28 md:py-8 text-center text-gray-500 text-sm">
                <p>PARAMASHAKTI SHRI GURU KOTTURESHWARA TRUST © {new Date().getFullYear()}</p>
                <p className="mt-2 text-xs text-gray-400 font-medium">Developed and Maintained by <span className="font-black text-orange-500 tracking-wider">VIDEC</span></p>
            </footer>
        </div>
    );
};

export default PublicDashboard;
