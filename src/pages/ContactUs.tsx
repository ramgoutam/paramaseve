import PublicHeader from "@/components/PublicHeader";
import TopRibbon from "@/components/TopRibbon";
import { MapPin, Phone, Mail, Users, Instagram } from "lucide-react";

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
                                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                                        <Mail className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Email Us</p>
                                        <p className="font-bold text-gray-800 text-lg md:text-xl break-all">pskottureshwaratrustr@gmail.com</p>
                                        <p className="text-gray-500 text-sm mt-1">We'll respond within 24 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl border border-pink-100">
                                        <Instagram className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Follow Us</p>
                                        <a
                                            href="https://www.instagram.com/pskottureshwaratrustr"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold text-gray-800 text-lg md:text-xl hover:text-pink-600 transition-colors"
                                        >
                                            @pskottureshwaratrustr
                                        </a>
                                        <p className="text-gray-500 text-sm mt-1">Get latest updates</p>
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

                {/* Team Details Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                    {/* Trust Team */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="bg-orange-100 p-2 rounded-lg text-orange-600"><Users className="h-6 w-6" /></span>
                            Trust Team
                        </h3>
                        <div className="space-y-2">
                            {[
                                { name: "Nagaraj", role: "President", phone: "6361263254" },
                                { name: "Abhi", role: "Secretary", phone: "8147115592" },
                                { name: "Aramani Naveen", role: "Team Member", phone: "8660954427" },
                                { name: "Sagar", role: "Team Member", phone: "9036321785" },
                                { name: "Rudresh", role: "Team Member", phone: "6360073187" }
                            ].map((member, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">{member.name}</p>
                                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">{member.role}</p>
                                    </div>
                                    <a href={`tel:+91${member.phone}`} className="mt-1 sm:mt-0 font-mono text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded text-xs hover:bg-orange-100 hover:text-orange-700 transition-colors">
                                        +91 {member.phone}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Honorable Suggestions Team */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users className="h-6 w-6" /></span>
                            Honorable Suggestions Team
                        </h3>
                        <div className="space-y-2">
                            {[
                                { name: "Mahesh", phone: "9071191949" },
                                { name: "Prakash", phone: "9880399941" },
                                { name: "Manu", phone: "9742110498" },
                                { name: "Guru", phone: "9880439003" },
                                { name: "Sandeep", phone: "9902317545" }
                            ].map((member, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                    <p className="font-bold text-gray-900 text-base">{member.name}</p>
                                    <a href={`tel:+91${member.phone}`} className="mt-1 sm:mt-0 font-mono text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                        +91 {member.phone}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 pt-8 pb-28 md:py-8 text-center text-gray-500 text-sm">
                <p>PARAMASHAKTI SHRI GURU KOTTURESHWARA TRUST © {new Date().getFullYear()}</p>
                <p className="mt-2 text-xs text-gray-400 font-medium">Developed and Maintained by <span className="font-black text-orange-500 tracking-wider">VIDEC</span></p>
            </footer>
        </div>
    );
};

export default ContactUs;
