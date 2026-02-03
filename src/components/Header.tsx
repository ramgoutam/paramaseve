
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Globe, Plus, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartHandshake, Wallet } from "lucide-react";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, role, session } = useAuth();
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    const isFormPage = location.pathname === '/add-donation' || location.pathname === '/add-expense';

    // Get the user's name or email securely
    const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Volunteer";
    const initials = userName
        .split(' ')
        .map((n: any) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'kn' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm flex-none h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <img src="/Logo.jpeg" alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                    <h1 className="text-xl font-bold text-gray-800 hidden md:block">Dashboard</h1>
                </div>

                <div className="flex items-center gap-3">
                    {isFormPage ? (
                        <Button onClick={() => navigate("/dashboard")} variant="ghost" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 gap-2 h-9 text-sm font-medium md:mr-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden md:inline">Back</span>
                        </Button>
                    ) : (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 h-9 text-sm shadow-sm md:mr-2">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden md:inline">Add</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New Entry</DialogTitle>
                                    <DialogDescription>
                                        Choose what you would like to record.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div
                                        onClick={() => {
                                            navigate("/add-donation");
                                            setOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-orange-100 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-200 cursor-pointer transition-all hover:-translate-y-1 group"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <HeartHandshake className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Donation</span>
                                    </div>

                                    <div
                                        onClick={() => {
                                            navigate("/add-expense");
                                            setOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200 cursor-pointer transition-all hover:-translate-y-1 group"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Wallet className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Expense</span>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focust:ring-0">
                                <Avatar className="h-9 w-9 border border-orange-200 cursor-pointer hover:ring-2 hover:ring-orange-100 transition-all">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-orange-50 text-orange-700 font-bold text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56" forceMount>
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-gray-900">{userName}</p>
                                    <p className="text-xs leading-none text-gray-500 capitalize">{role || "Volunteer"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {role === 'admin' && (
                                <DropdownMenuItem onClick={() => navigate("/users")} className="cursor-pointer">
                                    <Users className="mr-2 h-4 w-4 text-gray-500" />
                                    <span>Manage Users</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
