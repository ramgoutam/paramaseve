import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users, FileText, ArrowRight } from "lucide-react";
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await supabase.rpc('get_public_stats');
                if (error) throw error;
                if (data) setStats(data);
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
            </main>

            <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
                <p>P S SHRI GURU KOTTURESHWARA TRUST © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default PublicDashboard;
