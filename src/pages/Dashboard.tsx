import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, FileText, LayoutDashboard, History, Users, Eye, Download, Calendar, IndianRupee, User, Phone, CreditCard, ShoppingBasket, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { generateDonationPDF, DonationData } from "@/lib/receiptGenerator";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
    const navigate = useNavigate();
    const { signOut, role, session } = useAuth();

    // Get the user's name or email securely
    const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Volunteer";

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    interface Donation {
        id: string;
        donor_name: string;
        mobile_number: string;
        amount: number;
        payment_mode: "UPI" | "CASH" | "GROCERIES";
        address?: string;
        utr_number?: string;
        grocery_items?: any[];
        notes?: string;
        created_at: string;
        created_by: string;
        receipt_no?: string;
    }

    const [donations, setDonations] = useState<Donation[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); // Use 'any' or define Expense interface
    const [loadingDonations, setLoadingDonations] = useState(true);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [view, setView] = useState<'donations' | 'expenses' | 'users'>('donations');
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
    const [userStats, setUserStats] = useState({
        totalCollection: 0,
        todayCollection: 0,
        totalExpenses: 0,
        todayExpenses: 0,
        todayCount: 0
    });
    const [userCollectionData, setUserCollectionData] = useState<Array<{
        userId: string;
        userName: string;
        totalCollection: number;
        totalExpenses: number;
        donationCount: number;
        role: string;
    }>>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isExpensePreviewOpen, setIsExpensePreviewOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedUser, setSelectedUser] = useState<string>(""); // For admin to filter by user
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const { t, i18n } = useTranslation();
    const { toast } = useToast();

    useEffect(() => {
        const fetchDonations = async () => {
            setLoadingDonations(true);
            let query = supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter by user if selected (admin only)
            if (selectedUser && selectedUser !== 'all' && (role === 'admin' || role === 'manager')) {
                query = query.eq('created_by', selectedUser);
            }

            if (selectedDate) {
                // Filter by specific date for timestamp column
                const startDate = new Date(selectedDate);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(selectedDate);
                endDate.setHours(23, 59, 59, 999);

                query = query.gte('created_at', startDate.toISOString())
                    .lte('created_at', endDate.toISOString());
            } else {
                query = query.limit(50);
            }

            const { data } = await query;
            if (data) setDonations(data);
            setLoadingDonations(false);
        };

        const fetchExpenses = async () => {
            setLoadingExpenses(true);
            let query = supabase
                .from('expenses')
                .select('*')
                .order('expense_date', { ascending: false });

            // Filter by user if selected (admin only)
            if (selectedUser && selectedUser !== 'all' && (role === 'admin' || role === 'manager')) {
                query = query.eq('created_by', selectedUser);
            }

            if (selectedDate) {
                // expense_date is a date column (YYYY-MM-DD)
                query = query.eq('expense_date', selectedDate);
            } else {
                query = query.limit(50);
            }

            const { data } = await query;
            if (data) setExpenses(data);
            setLoadingExpenses(false);
        };

        const fetchUserStats = async () => {
            if (!session?.user?.id) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const isManagement = role === 'admin' || role === 'manager';

            // 1. Total Collection (all-time) - ALL users for manager/admin, own for regular user
            let totalQuery = supabase.from('donations').select('amount');
            if (!isManagement) totalQuery = totalQuery.eq('created_by', session.user.id);
            const { data: totalData } = await totalQuery;

            let total = 0;
            if (totalData) {
                total = totalData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            }

            // 2. Today's Collection - ALL users for manager/admin, own for regular user
            let todayQuery = supabase.from('donations').select('amount').gte('created_at', today.toISOString()).lte('created_at', todayEnd.toISOString());
            if (!isManagement) todayQuery = todayQuery.eq('created_by', session.user.id);
            const { data: todayDonations } = await todayQuery;

            let todayTotal = 0;
            if (todayDonations) {
                todayTotal = todayDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            }

            // 3. Today's Receipts Count
            let countQuery = supabase.from('donations').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString());
            if (!isManagement) countQuery = countQuery.eq('created_by', session.user.id);
            const { count } = await countQuery;

            // 4. Total Expenses (all-time) - ALL users for manager/admin, own for regular user
            let expensesQuery = supabase.from('expenses').select('amount');
            if (!isManagement) expensesQuery = expensesQuery.eq('created_by', session.user.id);
            const { data: totalExpensesData } = await expensesQuery;

            let totalExp = 0;
            if (totalExpensesData) {
                totalExp = totalExpensesData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            }

            // 5. Today's Expenses - ALL users for manager/admin, own for regular user
            const todayDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            let todayExpQuery = supabase.from('expenses').select('amount').eq('expense_date', todayDateStr);
            if (!isManagement) todayExpQuery = todayExpQuery.eq('created_by', session.user.id);
            const { data: todayExpensesData } = await todayExpQuery;

            let todayExp = 0;
            if (todayExpensesData) {
                todayExp = todayExpensesData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            }

            setUserStats({
                totalCollection: total,
                todayCollection: todayTotal,
                totalExpenses: totalExp,
                todayExpenses: todayExp,
                todayCount: count || 0
            });
        };

        const fetchUserCollectionData = async () => {
            if (role !== 'admin' && role !== 'manager') return;

            try {
                // Fetch profiles
                const { data: profiles, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .order('full_name', { ascending: true });

                if (error) throw error;

                // Simple aggregation by fetching all and grouping
                const { data: donations } = await supabase.from('donations').select('amount, created_by');
                const { data: expenses } = await supabase.from('expenses').select('amount, created_by');

                const users = profiles
                    .filter(p => p.role !== 'admin')
                    .map(p => {
                        const userDonations = donations?.filter(d => d.created_by === p.id) || [];
                        const userExpenses = expenses?.filter(e => e.created_by === p.id) || [];

                        return {
                            userId: p.id,
                            userName: p.full_name || 'Unknown User',
                            totalCollection: userDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
                            totalExpenses: userExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
                            donationCount: userDonations.length,
                            role: p.role
                        };
                    });

                setUserCollectionData(users);
            } catch (error) {
                console.error('Error fetching user list:', error);
            }
        };

        fetchDonations();
        fetchExpenses();
        fetchUserStats();
        fetchUserCollectionData();
    }, [selectedDate, selectedUser, session?.user?.id, role]);

    const formatDateIST = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDownload = async (donation: Donation) => {
        setDownloadingId(donation.id);
        try {
            const data: DonationData = {
                donorName: donation.donor_name,
                amount: donation.amount?.toString() || "",
                paymentMode: donation.payment_mode,
                mobileNumber: donation.mobile_number,
                notes: donation.notes || "",
                utrNumber: donation.utr_number,
                groceryList: donation.grocery_items || [],
                createdAt: donation.created_at,
                receiptNo: donation.receipt_no
            };
            // Default to English for quick download
            // We need a translator function. Since we are in dashboard, 't' might be generic.
            // But generateDonationPDF needs receipt keys.
            // Dashboard might not have receipt namespaces loaded if not configured? 
            // Actually 'common' usually loads.
            // If keys assume 'message', we need to check namespaces.
            // Assuming 't' works for now or basic keys.
            await generateDonationPDF(data, "en", t);
        } catch (e) {
            console.error(e);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleShare = async (donation: Donation) => {
        setDownloadingId(donation.id);
        try {
            const data: DonationData = {
                donorName: donation.donor_name,
                amount: donation.amount?.toString() || "",
                paymentMode: donation.payment_mode,
                mobileNumber: donation.mobile_number,
                notes: donation.notes || "",
                utrNumber: donation.utr_number,
                groceryList: donation.grocery_items || [],
                createdAt: donation.created_at,
                receiptNo: donation.receipt_no
            };

            const file = await generateDonationPDF(data, "en", t, true) as File;


            // Direct WhatsApp Flow (Bypasses "Share Sheet")
            // 1. Auto-download the file so user can attach it
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // 2. Open WhatsApp directly with pre-filled message
            const text = encodeURIComponent(`Dear ${donation.donor_name}, thank you for your donation. Please find the receipt attached.`);
            window.open(`https://wa.me/91${donation.mobile_number}?text=${text}`, '_blank');

            toast({
                title: "Opening WhatsApp...",
                description: "Receipt downloaded! Please attach the PDF from your downloads.",
                duration: 4000,
            });
        } catch (e) {
            console.error(e);
            toast({
                title: "Share Failed",
                description: "Could not generate or share the receipt.",
                variant: "destructive"
            });
        } finally {
            setDownloadingId(null);
        }
    };

    const openPreview = (donation: Donation) => {
        setSelectedDonation(donation);
        setIsPreviewOpen(true);
    };

    const openExpensePreview = (expense: any) => {
        setSelectedExpense(expense);
        setIsExpensePreviewOpen(true);
    };

    return (
        <div className="h-full flex flex-col overflow-auto">

            {/* Main Content - No Scroll on Body, Flex Layout */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col gap-0 min-h-0">

                {/* Banner Section */}
                <div className="text-center space-y-3 py-2 flex-none shrink-0">
                    <div className="bg-white rounded-2xl shadow-lg shadow-orange-900/5 border border-gray-100 overflow-hidden">
                        <img
                            src='/banner-kn.jpg'
                            alt="Trust Banner"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>

                {/* 2. Stats Grid (Compact) - Only for Volunteers */}
                {(role !== 'admin' && role !== 'manager') && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none shrink-0 mb-4">
                        {/* Stats Cards - Visible to everyone now, showing THEIR stats */}
                        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-medium text-gray-600">My Total Collection</CardTitle>
                                <IndianRupee className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent className="pb-4 px-4">
                                <div className="text-xl font-bold text-gray-800">
                                    ₹{userStats.totalCollection.toLocaleString('en-IN')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-100 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-medium text-gray-600">Collection Today</CardTitle>
                                <IndianRupee className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent className="pb-4 px-4">
                                <div className="text-xl font-bold text-gray-800">
                                    ₹{userStats.todayCollection.toLocaleString('en-IN')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-100 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-medium text-gray-600">My Total Expenses</CardTitle>
                                <IndianRupee className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent className="pb-4 px-4">
                                <div className="text-xl font-bold text-gray-800">
                                    ₹{userStats.totalExpenses.toLocaleString('en-IN')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-100 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-medium text-gray-600">Expenses Today</CardTitle>
                                <IndianRupee className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent className="pb-4 px-4">
                                <div className="text-xl font-bold text-gray-800">
                                    ₹{userStats.todayExpenses.toLocaleString('en-IN')}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}


                {/* Team Data Tiles (Only for Admin/Manager) */}
                {(role === 'admin' || role === 'manager') && userCollectionData.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-purple-100 p-1.5 rounded-lg">
                                <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Team Data</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Team Total Collection */}
                            <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm border border-green-100/50">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight mb-1">Total Collected</p>
                                            <div className="text-2xl font-black text-green-700">
                                                ₹{userCollectionData.reduce((sum, u) => sum + u.totalCollection, 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                            <IndianRupee className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-green-600/70 font-medium">
                                        Aggregate of {userCollectionData.length} team members
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Team Total Expenses */}
                            <Card className="border-none bg-gradient-to-br from-red-50 to-orange-50 shadow-sm border border-red-100/50">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight mb-1">Total Expenses</p>
                                            <div className="text-2xl font-black text-red-700">
                                                ₹{userCollectionData.reduce((sum, u) => sum + u.totalExpenses, 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-red-600/70 font-medium">
                                        Overall team spending
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Team Net Balance */}
                            <Card className="border-none bg-gradient-to-br from-purple-50 to-blue-50 shadow-sm border border-purple-100/50">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight mb-1">Team Net Balance</p>
                                            <div className="text-2xl font-black text-purple-700">
                                                ₹{(userCollectionData.reduce((sum, u) => sum + u.totalCollection, 0) - userCollectionData.reduce((sum, u) => sum + u.totalExpenses, 0)).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                            <LayoutDashboard className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-purple-600/70 font-medium">
                                        Net available with the team
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}


                {/* 3. Recent Donations (Fills Remaining Space) */}
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="py-2.5 px-4 flex-none border-b border-gray-50 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                            <CardTitle className="text-lg whitespace-nowrap">
                                {selectedDate
                                    ? <span className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /> <span className="text-base text-gray-700 font-medium">{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span></span>
                                    : (view === 'donations' ? 'Recent Donations' : view === 'expenses' ? 'Recent Expenses' : 'Users')
                                }
                            </CardTitle>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {/* Toggle Buttons */}
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setView('donations')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'donations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Donations
                                    </button>
                                    <button
                                        onClick={() => setView('expenses')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'expenses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Expenses
                                    </button>
                                    {(role === 'admin' || role === 'manager') && (
                                        <button
                                            onClick={() => setView('users')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Users
                                        </button>
                                    )}
                                </div>

                                <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

                                {/* Filter Icons */}
                                <div className="flex items-center gap-2">
                                    {/* User Filter - Only for Admin/Manager */}
                                    {(role === 'admin' || role === 'manager') && (
                                        <div className="relative">
                                            {selectedUser && selectedUser !== 'all' ? (
                                                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-sm">
                                                    <Users className="h-4 w-4 text-purple-600" />
                                                    <span className="text-purple-700 font-medium hidden md:inline">
                                                        {userCollectionData.find(u => u.userId === selectedUser)?.userName || 'User'}
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedUser("all")}
                                                        className="ml-1 text-purple-600 hover:text-purple-800 transition-colors"
                                                        title="Clear User Filter"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                                    <SelectTrigger className="h-9 w-auto px-3 border-gray-200 hover:bg-gray-50 hover:border-purple-300 gap-2">
                                                        <Users className="h-4 w-4 text-gray-500" />
                                                        <span className="text-xs text-gray-600 font-medium hidden sm:inline">User</span>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Users</SelectItem>
                                                        {userCollectionData.map(user => (
                                                            <SelectItem key={user.userId} value={user.userId}>
                                                                {user.userName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    )}

                                    {/* Date Filter */}
                                    {selectedDate ? (
                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-blue-700 font-medium hidden md:inline">
                                                {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <button
                                                onClick={() => setSelectedDate("")}
                                                className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Clear Filter"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="opacity-0 absolute inset-0 w-9 h-9 cursor-pointer"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                title="Filter by Date"
                                            />
                                            <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all">
                                                <Calendar className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {view === 'donations' ? (
                            loadingDonations ? (
                                <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
                            ) : donations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
                                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                                        <FileText className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">No donations yet</h3>
                                    <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">
                                        Start by adding a new donation entry.
                                    </p>
                                    <Button onClick={() => navigate("/add-donation")} variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-50 text-xs h-9">
                                        <Plus className="mr-2 h-3 w-3" /> Add Donation
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    {/* Desktop Donation Table */}
                                    <div className="hidden md:block h-full">
                                        <Table>
                                            <TableHeader className="bg-gray-50/50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[180px]">Date</TableHead>
                                                    <TableHead>Donor</TableHead>
                                                    <TableHead>Mode</TableHead>
                                                    {(role === 'admin' || role === 'manager') && <TableHead>Collected By</TableHead>}
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {donations.map((donation) => (
                                                    <TableRow key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <TableCell className="text-xs text-gray-500 font-medium">
                                                            {formatDateIST(donation.created_at)}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900">
                                                            <div className="flex flex-col">
                                                                <span>{donation.donor_name}</span>
                                                                <span className="text-[10px] text-gray-400 font-normal">{donation.mobile_number}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="secondary"
                                                                className={`
                                                                    text-[10px] uppercase tracking-wider font-semibold 
                                                                    ${donation.payment_mode === 'CASH' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                                    ${donation.payment_mode === 'UPI' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                                                                    ${donation.payment_mode === 'GROCERIES' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' : ''}
                                                                `}
                                                            >
                                                                {donation.payment_mode}
                                                            </Badge>
                                                        </TableCell>
                                                        {(role === 'admin' || role === 'manager') && (
                                                            <TableCell className="text-xs text-gray-600">
                                                                {userCollectionData.find(u => u.userId === donation.created_by)?.userName || 'Admin'}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="text-right font-bold text-gray-700">
                                                            {donation.payment_mode === 'GROCERIES' ? '-' : `₹${donation.amount}`}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                                    onClick={() => openPreview(donation)}
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                                                                    onClick={() => handleDownload(donation)}
                                                                    disabled={downloadingId === donation.id}
                                                                    title="Download Receipt"
                                                                >
                                                                    {downloadingId === donation.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" /> : <Download className="h-4 w-4" />}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50"
                                                                    onClick={() => handleShare(donation)}
                                                                    disabled={downloadingId === donation.id}
                                                                    title="Share on WhatsApp"
                                                                >
                                                                    <Share2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Donation List */}
                                    <div className="md:hidden space-y-3 p-4 pb-20">
                                        {donations.map(donation => (
                                            <div key={donation.id} className="bg-white border boundary-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${donation.payment_mode === 'CASH' ? 'bg-green-500' :
                                                    donation.payment_mode === 'UPI' ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`}></div>

                                                <div className="flex justify-between items-start pl-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-sm">{donation.donor_name}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">{formatDateIST(donation.created_at)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 text-base">
                                                            {donation.payment_mode === 'GROCERIES' ? '-' : `₹${donation.amount}`}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${donation.payment_mode === 'CASH' ? 'bg-green-50 text-green-700 hover:bg-green-50' :
                                                                    donation.payment_mode === 'UPI' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : 'bg-orange-50 text-orange-700 hover:bg-orange-50'
                                                                    }`}>
                                                                {donation.payment_mode}
                                                            </Badge>
                                                            {(role === 'admin' || role === 'manager') && (
                                                                <span className="text-[9px] text-gray-400">
                                                                    By: {userCollectionData.find(u => u.userId === donation.created_by)?.userName || 'Admin'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-1 pl-2">
                                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600" onClick={() => openPreview(donation)}>
                                                        <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700" onClick={() => handleDownload(donation)} disabled={downloadingId === donation.id}>
                                                        {downloadingId === donation.id ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent mr-1.5" /> : <Download className="h-3.5 w-3.5 mr-1.5" />} Save
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700" onClick={() => handleShare(donation)} disabled={downloadingId === donation.id}>
                                                        <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : view === 'expenses' ? (
                            // Expenses View
                            loadingExpenses ? (
                                <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
                            ) : expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
                                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                                        <FileText className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">No expenses recorded</h3>
                                    <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">
                                        Record new expenses to track spending.
                                    </p>
                                    <Button onClick={() => navigate("/add-expense")} variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs h-9">
                                        <Plus className="mr-2 h-3 w-3" /> Add Expense
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    {/* Desktop Expenses Table */}
                                    <div className="hidden md:block h-full">
                                        <Table>
                                            <TableHeader className="bg-gray-50/50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[150px]">Date</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Paid To</TableHead>
                                                    {(role === 'admin' || role === 'manager') && <TableHead>By</TableHead>}
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {expenses.map((expense) => (
                                                    <TableRow key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <TableCell className="text-xs text-gray-500 font-medium">
                                                            {new Date(expense.expense_date).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900">
                                                            <div className="flex flex-col">
                                                                <span>{expense.title}</span>
                                                                {expense.payment_mode && (
                                                                    <span className="text-[10px] text-gray-400 font-normal">{expense.payment_mode}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">
                                                                {expense.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-600">
                                                            {expense.paid_to || "-"}
                                                        </TableCell>
                                                        {(role === 'admin' || role === 'manager') && (
                                                            <TableCell className="text-xs text-gray-600">
                                                                {userCollectionData.find(u => u.userId === expense.created_by)?.userName || 'Admin'}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="text-right font-bold text-gray-700">
                                                            ₹{expense.amount}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => openExpensePreview(expense)}
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Expense List */}
                                    <div className="md:hidden space-y-3 p-4 pb-20">
                                        {expenses.map(expense => (
                                            <div key={expense.id} className="bg-white border boundary-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

                                                <div className="flex justify-between items-start pl-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-sm">{expense.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(expense.expense_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 text-base">
                                                            ₹{expense.amount}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                {expense.category}
                                                            </span>
                                                            {(role === 'admin' || role === 'manager') && (
                                                                <span className="text-[9px] text-gray-400">
                                                                    By: {userCollectionData.find(u => u.userId === expense.created_by)?.userName || 'Admin'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pl-2 flex items-center justify-between pt-2 border-t border-gray-50">
                                                    <span className="text-xs text-gray-500">{expense.paid_to}</span>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => openExpensePreview(expense)}>
                                                        <Eye className="h-3 w-3 mr-1" /> View
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : view === 'users' ? (
                            <div className="flex flex-col h-full bg-white">
                                {role === 'admin' && (
                                    <div className="p-4 border-b border-gray-50 flex justify-end bg-gray-50/30">
                                        <Button
                                            onClick={() => navigate("/users")}
                                            variant="outline"
                                            className="h-8 text-[11px] gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 font-bold"
                                        >
                                            <Users className="h-3 w-3" /> Go to User Management
                                        </Button>
                                    </div>
                                )}

                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow className="hover:bg-transparent border-b border-gray-100">
                                                <TableHead className="py-4 font-bold text-gray-700">Team Member</TableHead>
                                                <TableHead className="font-bold text-gray-700">Role</TableHead>
                                                <TableHead className="text-right font-bold text-green-700">Collections</TableHead>
                                                <TableHead className="text-right font-bold text-red-700">Expenses</TableHead>
                                                <TableHead className="text-right font-bold text-purple-700">Net Balance</TableHead>
                                                <TableHead className="w-[100px] text-right font-bold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-50">
                                            {userCollectionData.map((user) => (
                                                <TableRow key={user.userId} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                                    <TableCell className="font-bold text-gray-900 py-4">{user.userName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`capitalize text-[10px] py-0 px-1.5 h-5 font-bold ${user.role === 'manager' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-black text-green-600">
                                                        ₹{user.totalCollection.toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-black text-red-600">
                                                        ₹{user.totalExpenses.toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-black text-purple-600">
                                                        ₹{(user.totalCollection - user.totalExpenses).toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-[11px] font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                                                            onClick={() => {
                                                                setSelectedUser(user.userId);
                                                                setView('donations');
                                                            }}
                                                        >
                                                            Filter Data
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile User List */}
                                <div className="md:hidden flex flex-col divide-y divide-gray-100">
                                    {userCollectionData.map((user) => (
                                        <div key={user.userId} className="p-4 bg-white flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-sm tracking-tight">{user.userName}</h4>
                                                    <Badge variant="outline" className={`mt-1 capitalize text-[9px] h-4 font-bold ${user.role === 'manager' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                                                        {user.role}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 px-3 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border-none"
                                                    onClick={() => {
                                                        setSelectedUser(user.userId);
                                                        setView('donations');
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Collected</span>
                                                    <span className="text-xs font-black text-green-600">₹{user.totalCollection.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Expenses</span>
                                                    <span className="text-xs font-black text-red-600">₹{user.totalExpenses.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight text-right">Balance</span>
                                                    <span className="text-xs font-black text-purple-600">
                                                        ₹{(user.totalCollection - user.totalExpenses).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

            </main>

            {/* Donation Details Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Donation Details</DialogTitle>
                        <DialogDescription>
                            Receipt generated on {selectedDonation ? formatDateIST(selectedDonation.created_at) : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDonation && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Donor Name</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <User className="h-3 w-3 text-orange-500" /> {selectedDonation.donor_name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Mobile</span>
                                    <span className="font-medium flex items-center justify-end gap-2">
                                        {selectedDonation.mobile_number} <Phone className="h-3 w-3 text-orange-500" />
                                    </span>
                                </div>
                                {selectedDonation.address && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Address</span>
                                        <span className="font-medium text-gray-700">{selectedDonation.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Receipt No</span>
                                    <span className="font-mono font-bold text-gray-900">{selectedDonation.receipt_no || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Type</span>
                                    <Badge variant="outline" className="bg-white">{selectedDonation.payment_mode}</Badge>
                                </div>

                                {selectedDonation.payment_mode !== 'GROCERIES' && (
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Amount</span>
                                        <span className="text-2xl font-bold text-orange-600">₹{selectedDonation.amount}</span>
                                    </div>
                                )}

                                {selectedDonation.payment_mode === 'UPI' && selectedDonation.utr_number && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                                        <span className="text-xs text-gray-500">UTR Ref</span>
                                        <span className="text-xs font-mono font-medium">{selectedDonation.utr_number}</span>
                                    </div>
                                )}
                            </div>

                            {selectedDonation.payment_mode === 'GROCERIES' && selectedDonation.grocery_items && selectedDonation.grocery_items.length > 0 && (
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                        <ShoppingBasket className="h-3 w-3" /> Grocery Items
                                    </span>
                                    <div className="border border-gray-100 rounded-lg overflow-hidden text-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 font-medium text-gray-600 text-xs">Item</th>
                                                    <th className="px-3 py-2 font-medium text-gray-600 text-xs text-right">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {selectedDonation.grocery_items.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2">{item.name}</td>
                                                        <td className="px-3 py-2 text-right text-gray-600 text-xs">{item.quantity} {item.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {selectedDonation.notes && (
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Notes</span>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                        "{selectedDonation.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                        <Button variant="outline" className="text-gray-500" onClick={() => selectedDonation && handleShare(selectedDonation)}>
                            <Share2 className="h-4 w-4 mr-2" /> Share
                        </Button>
                        {selectedDonation && (
                            <Button onClick={() => handleDownload(selectedDonation)} disabled={downloadingId === selectedDonation.id} className="bg-orange-600 hover:bg-orange-700">
                                {downloadingId === selectedDonation.id ? <span className="animate-spin mr-2">⏳</span> : <Download className="h-4 w-4 mr-2" />}
                                Download PDF
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Expense Details Modal */}
            <Dialog open={isExpensePreviewOpen} onOpenChange={setIsExpensePreviewOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Expense Details</DialogTitle>
                        <DialogDescription>
                            Recorded on {selectedExpense ? new Date(selectedExpense.expense_date).toLocaleDateString() : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedExpense && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedExpense.title}</h3>
                                    <Badge variant="outline" className="bg-white text-[10px] mt-0.5">{selectedExpense.category}</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Amount</span>
                                    <span className="text-xl font-bold text-gray-900">₹{selectedExpense.amount}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Paid To</span>
                                    <span className="font-medium text-gray-900 flex items-center justify-end gap-1">
                                        {selectedExpense.paid_to || 'N/A'} <User className="h-3 w-3 text-gray-400" />
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Payment Mode</span>
                                    <span className="font-medium text-gray-900">{selectedExpense.payment_mode}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Expense Date</span>
                                    <span className="font-medium text-gray-900">{new Date(selectedExpense.expense_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {selectedExpense.description && (
                                <div className="pt-2">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Description</span>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                        "{selectedExpense.description}"
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 text-xs text-gray-400 text-center">
                                Recorded at {new Date(selectedExpense.created_at).toLocaleString()}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsExpensePreviewOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
