import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X, Phone, IndianRupee, Home, HandHeart } from "lucide-react";
import { useState } from "react";

const PublicHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Donations/Expenses', path: '/public-data', icon: IndianRupee },
        { name: 'Support Us', path: '/support-us', icon: HandHeart },
        { name: 'Contact Us', path: '/contact', icon: Phone },
    ];

    return (
        <>
            <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm z-50 flex-none h-16 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    {/* Left - Logo Section */}
                    <div className="flex-1 flex items-center justify-start">
                        <div className="flex items-center gap-2 cursor-pointer h-full" onClick={() => navigate("/")}>
                            <img src="/Logo.jpeg" alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                            <h1 className="text-xl font-bold text-gray-800 hidden lg:block whitespace-nowrap">PSGKT Kottur</h1>
                            <h1 className="text-xl font-bold text-gray-800 lg:hidden">PSGKT</h1>
                        </div>
                    </div>

                    {/* Center - Desktop Navigation */}
                    <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 h-full z-10">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => navigate(link.path)}
                                    className={`
                                        text-sm font-bold transition-all flex items-center gap-2 h-full border-b-2 px-1 whitespace-nowrap
                                        ${isActive
                                            ? 'text-orange-600 border-orange-600'
                                            : 'text-gray-500 border-transparent hover:text-orange-500 hover:border-orange-200'
                                        }
                                    `}
                                >
                                    <link.icon className={`h-4 w-4 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                                    {link.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right - Actions */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        <Button onClick={() => navigate("/login")} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-md shadow-orange-600/20 px-4 h-10 rounded-xl flex font-bold">
                            <LogIn className="h-4 w-4" />
                            <span className="hidden xs:inline">Login</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation - Only visible on small screens */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] z-[100] h-[72px] pb-[env(safe-area-inset-bottom)]">
                <div className="grid grid-cols-4 h-full">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <button
                                key={link.name}
                                onClick={() => navigate(link.path)}
                                className="flex flex-col items-center justify-center gap-1.5 transition-all relative overflow-hidden active:scale-95"
                            >
                                <div className={`
                                    p-1.5 rounded-xl transition-all
                                    ${isActive ? 'bg-orange-600 text-white' : 'text-gray-400'}
                                `}>
                                    <link.icon className="h-5 w-5" />
                                </div>
                                <span className={`
                                    text-[10px] font-black tracking-tight uppercase leading-none
                                    ${isActive ? 'text-orange-600' : 'text-gray-400'}
                                `}>
                                    {link.name.split('/')[0]}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 w-12 h-1 bg-orange-600 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default PublicHeader;
