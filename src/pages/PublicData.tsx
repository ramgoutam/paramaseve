import PublicHeader from "@/components/PublicHeader";
import TopRibbon from "@/components/TopRibbon";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { IndianRupee, FileText, Users, TrendingUp, ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { legacyDonations2025, legacyExpenses2025, legacyStats2025 } from "@/data/legacyData2025";

const PublicData = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [stats, setStats] = useState({
        total_amount: 0,
        total_donations: 0,
        total_volunteers: 0,
        total_expenses: 0
    });
    const [recentDonations, setRecentDonations] = useState<any[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<'donations' | 'expenses'>('donations');

    const availableYears = [2026, 2025];

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                if (selectedYear === 2025) {
                    // Use Legacy Kannada Data for 2025
                    setStats(legacyStats2025);
                    setRecentDonations(legacyDonations2025);
                    setRecentExpenses(legacyExpenses2025);
                } else {
                    const startOfYear = `${selectedYear}-01-01T00:00:00`;
                    const endOfYear = `${selectedYear}-12-31T23:59:59`;

                    // 1. Fetch Year-Specific Donations
                    const { data: yearDonations, error: donError } = await supabase
                        .from('donations')
                        .select('donor_name, amount, created_at, payment_mode')
                        .gte('created_at', startOfYear)
                        .lte('created_at', endOfYear)
                        .order('created_at', { ascending: false });

                    if (donError) throw donError;

                    // 2. Fetch Year-Specific Expenses
                    const { data: yearExpenses, error: expError } = await supabase
                        .from('expenses')
                        .select('title, amount, expense_date, category')
                        .gte('expense_date', startOfYear)
                        .lte('expense_date', endOfYear)
                        .order('expense_date', { ascending: false });

                    if (expError) throw expError;

                    // 3. Fetch Volunteer count
                    const { data: volData } = await supabase.from('users').select('count', { count: 'exact', head: true });

                    const totalDonationAmount = yearDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
                    const totalExpenseAmount = yearExpenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

                    setStats({
                        total_amount: totalDonationAmount,
                        total_donations: yearDonations?.length || 0,
                        total_volunteers: 50,
                        total_expenses: totalExpenseAmount
                    });

                    setRecentDonations(yearDonations || []);
                    setRecentExpenses(yearExpenses || []);
                }
            } catch (error) {
                console.error('Error fetching public data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [selectedYear]);

    const netCollection = stats.total_amount - stats.total_expenses;

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <TopRibbon />
            <PublicHeader />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-gray-100">
                    <div className="text-left space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial Transparency</h1>
                        <p className="text-gray-600 text-lg">
                            Real-time tracking for the year <span className="text-orange-600 font-bold">{selectedYear}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        {availableYears.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`
                                    px-6 py-2 rounded-xl text-sm font-black transition-all
                                    ${selectedYear === year
                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="h-24 w-24 text-green-600" />
                        </div>
                        <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">Total Collections</p>
                        <p className="text-4xl font-black text-gray-900">₹{(stats.total_amount || 0).toLocaleString('en-IN')}</p>
                        <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-bold">
                            <ArrowUpRight className="h-4 w-4" />
                            <span>{stats.total_donations || 0} Receipts Issued</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-red-900/5 border border-red-100 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowDownRight className="h-24 w-24 text-red-600" />
                        </div>
                        <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">Total Expenses</p>
                        <p className="text-4xl font-black text-gray-900">₹{(stats.total_expenses || 0).toLocaleString('en-IN')}</p>
                        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm font-bold">
                            <ArrowDownRight className="h-4 w-4" />
                            <span>Operational Costs</span>
                        </div>
                    </div>

                    <div className="bg-orange-600 p-8 rounded-3xl shadow-xl shadow-orange-900/20 border border-orange-500 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <IndianRupee className="h-24 w-24 text-white" />
                        </div>
                        <p className="text-sm font-bold text-orange-100 uppercase tracking-widest mb-2">Net Balance</p>
                        <p className="text-4xl font-black text-white">₹{(netCollection || 0).toLocaleString('en-IN')}</p>
                        <div className="mt-4 flex items-center gap-2 text-orange-100 text-sm font-bold">
                            <TrendingUp className="h-4 w-4" />
                            <span>Available for Seva</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Toggle Switch */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setViewType('donations')}
                                className={`
                                    flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black transition-all
                                    ${viewType === 'donations'
                                        ? 'bg-white text-green-600 shadow-sm border border-green-100'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }
                                `}
                            >
                                <FileText className={`h-4 w-4 ${viewType === 'donations' ? 'text-green-600' : 'text-gray-400'}`} />
                                Donations
                            </button>
                            <button
                                onClick={() => setViewType('expenses')}
                                className={`
                                    flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black transition-all
                                    ${viewType === 'expenses'
                                        ? 'bg-white text-red-600 shadow-sm border border-red-100'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }
                                `}
                            >
                                <ArrowDownRight className={`h-4 w-4 ${viewType === 'expenses' ? 'text-red-600' : 'text-gray-400'}`} />
                                Expenses
                            </button>
                        </div>
                    </div>

                    {/* Single Table Container */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-900/5 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${viewType === 'donations' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {viewType === 'donations' ? <FileText className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                </div>
                                <h3 className="font-black text-gray-800 text-xl tracking-tight capitalize">
                                    {selectedYear} {viewType}
                                </h3>
                            </div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                                {viewType === 'donations' ? recentDonations.length : recentExpenses.length} Records
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">{viewType === 'donations' ? 'Donor Name' : 'Expense Title'}</th>
                                        <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Amount</th>
                                        <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {viewType === 'donations' ? (
                                        recentDonations.length > 0 ? (
                                            recentDonations.map((don, idx) => (
                                                <tr key={idx} className="hover:bg-green-50/30 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">{don.donor_name || 'Anonymous'}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{don.payment_mode || 'Online'}</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-green-600 text-lg">
                                                        {don.payment_mode === 'GROCERIES' || (don.amount || 0) === 0 ? 'N/A' : `₹${(don.amount || 0).toLocaleString('en-IN')}`}
                                                    </td>
                                                    <td className="px-8 py-5 text-right text-sm text-gray-500 font-medium">{don.created_at ? new Date(don.created_at).toLocaleDateString() : 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-400 font-medium">No donations found for this year.</td></tr>
                                        )
                                    ) : (
                                        recentExpenses.length > 0 ? (
                                            recentExpenses.map((exp, idx) => (
                                                <tr key={idx} className="hover:bg-red-50/30 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-gray-800 group-hover:text-red-700 transition-colors">{exp.title || 'Untitled Expense'}</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-red-600 text-lg">₹{(exp.amount || 0).toLocaleString('en-IN')}</td>
                                                    <td className="px-8 py-5 text-right text-sm text-gray-500 font-medium">{exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium">No expenses found for this year.</td></tr>
                                        )
                                    )}
                                </tbody>
                            </table>
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

export default PublicData;
