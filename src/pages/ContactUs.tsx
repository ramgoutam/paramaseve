import PublicHeader from "@/components/PublicHeader";
import TopRibbon from "@/components/TopRibbon";
import { MapPin, Phone, Mail } from "lucide-react";

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <TopRibbon />
            <PublicHeader />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Contact Us</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        We are here to help and answer any questions you might have. We look forward to hearing from you.
                    </p>
                </div>

                <div className="w-full bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 md:p-12 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                                        <MapPin className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Our Location</p>
                                        <p className="font-bold text-gray-800 text-xl leading-snug uppercase">
                                            P S SHRI GURU KOTTURESHWARA TRUST<br />
                                            KOTTURU, VIJAYANAGARA DIST<br />
                                            KARNATAKA, INDIA
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                                        <Phone className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Call Us</p>
                                        <p className="font-bold text-gray-800 text-2xl">+91 99000 00000</p>
                                        <p className="text-gray-500 text-sm mt-1">Available Mon-Sat, 9:00 AM - 6:00 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                                        <Mail className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Email Us</p>
                                        <p className="font-bold text-gray-800 text-xl">contact@psgkt-kottur.org</p>
                                        <p className="text-gray-500 text-sm mt-1">We'll respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-8 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15)_0,transparent_100%)]"></div>
                            <div className="relative z-10 text-center space-y-6">
                                <div className="h-24 w-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto transform -rotate-12 border-2 border-orange-200">
                                    <MapPin className="h-12 w-12 text-orange-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900">Visit Us in Kotturu</h3>
                                    <p className="text-gray-600 max-w-xs mx-auto">
                                        Experience the spiritual heritage and community service at our trust headquarters.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <img src="/Logo.jpeg" alt="Trust Logo" className="h-32 w-32 object-contain mx-auto rounded-3xl shadow-xl border-4 border-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
                <p>P S SHRI GURU KOTTURESHWARA TRUST © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default ContactUs;
