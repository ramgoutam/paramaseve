import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, IndianRupee, Wallet, FileText, Calendar, CreditCard, User, Building2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ExpenseData {
    title: string;
    amount: string;
    category: string;
    expenseDate: string;
    paymentMode: "CASH" | "UPI" | "BANK_TRANSFER";
    description: string;
    paidTo: string;
}

const AddExpense = () => {
    const { session } = useAuth();
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const [formData, setFormData] = useState<ExpenseData>({
        title: "",
        amount: "",
        category: "MAINTENANCE",
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMode: "UPI",
        description: "",
        paidTo: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            amount: "",
            category: "MAINTENANCE",
            expenseDate: new Date().toISOString().split('T')[0],
            paymentMode: "UPI",
            description: "",
            paidTo: "",
        });
        setShowSuccessDialog(false);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.amount || !formData.expenseDate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            if (session?.user) {
                // Determine table name - assume 'expenses' exists or created
                // Since I cannot create table directly, I assume it exists or I might fail here.
                // However, I will proceed assuming the table 'expenses' is there or will be there.
                /* 
                   Table Schema Expectation:
                   id (uuid, primary key)
                   title (text)
                   amount (numeric)
                   category (text)
                   expense_date (date)
                   payment_mode (text)
                   description (text)
                   paid_to (text)
                   created_by (uuid)
                   created_at (timestamptz)
                */

                const { error: dbError } = await supabase.from('expenses').insert({
                    title: formData.title,
                    amount: parseFloat(formData.amount),
                    category: formData.category,
                    expense_date: formData.expenseDate,
                    payment_mode: formData.paymentMode,
                    description: formData.description || null,
                    paid_to: formData.paidTo || null,
                    created_by: session.user.id
                });

                if (dbError) throw dbError;

                setShowSuccessDialog(true);
            }
        } catch (error: any) {
            console.error("Expense Save Error:", error);
            toast({
                title: "Error Saving Expense",
                description: error.message || "Failed to save expense details.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto flex flex-col w-full">
            <div className="flex-1 p-4 md:p-6 flex flex-col items-center animate-in fade-in duration-1000">

                <div className="w-full max-w-4xl space-y-6 relative z-10">

                    {/* Header Section */}
                    <div className="text-center space-y-3 py-2">
                        <div className="w-full flex items-center justify-center">
                            <img src="/banner-kn.jpg" alt="Banner" className="w-full max-w-4xl h-auto object-contain rounded-lg shadow-lg" />
                        </div>

                        <div className="animate-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-backwards flex items-center justify-center gap-2 text-blue-800">
                            <Wallet className="h-6 w-6" />
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter drop-shadow-sm">
                                Expense Management
                            </h1>
                        </div>
                    </div>

                    {/* Form Card */}
                    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-2xl rounded-3xl overflow-hidden ring-1 ring-gray-900/5 animate-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-backwards">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 py-3 px-4 md:px-6">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <CardTitle className="text-xl text-gray-900 font-bold">Record New Expense</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6 p-4 md:p-6">
                            <div className="grid gap-6 md:grid-cols-2">

                                {/* Title */}
                                <div className="space-y-3 group md:col-span-2">
                                    <Label htmlFor="title" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                        <FileText className="h-4 w-4" />
                                        Expense Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Monthly Electricity Bill"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="h-12 px-4 border-gray-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base rounded-xl shadow-sm"
                                    />
                                </div>

                                {/* Amount */}
                                <div className="space-y-3 group">
                                    <Label htmlFor="amount" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                        <IndianRupee className="h-4 w-4" />
                                        Amount <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            className="h-12 pl-10 border-gray-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base rounded-xl shadow-sm font-semibold"
                                        />
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-3 group">
                                    <Label htmlFor="expenseDate" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                        <Calendar className="h-4 w-4" />
                                        Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="expenseDate"
                                        name="expenseDate"
                                        type="date"
                                        value={formData.expenseDate}
                                        onChange={handleInputChange}
                                        required
                                        className="h-12 px-4 border-gray-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base rounded-xl shadow-sm"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-3 group">
                                    <Label htmlFor="category" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                        <Building2 className="h-4 w-4" />
                                        Category <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                        <SelectTrigger className="h-12 px-4 border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base rounded-xl shadow-sm">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="FOOD">Food / Groceries</SelectItem>
                                            <SelectItem value="SALARY">Salary / Wages</SelectItem>
                                            <SelectItem value="UTILITIES">Utilities (Electricity, Water)</SelectItem>
                                            <SelectItem value="EVENTS">Events / Pooja</SelectItem>
                                            <SelectItem value="TRANSPORT">Transport</SelectItem>
                                            <SelectItem value="MEDICAL">Medical</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-3 group">
                                    <Label htmlFor="paymentMode" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Mode <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.paymentMode} onValueChange={(val) => handleSelectChange('paymentMode', val)}>
                                        <SelectTrigger className="h-12 px-4 border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base rounded-xl shadow-sm">
                                            <SelectValue placeholder="Select Payment Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Paid To */}
                                <div className="space-y-3 group md:col-span-2">
                                    <Label htmlFor="paidTo" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                        <User className="h-4 w-4" />
                                        Paid To (Optional)
                                    </Label>
                                    <Input
                                        id="paidTo"
                                        name="paidTo"
                                        placeholder="Name of person or vendor"
                                        value={formData.paidTo}
                                        onChange={handleInputChange}
                                        className="h-12 px-4 border-gray-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base rounded-xl shadow-sm"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-3 group md:col-span-2">
                                    <Label htmlFor="description" className="text-gray-700 font-bold text-sm tracking-wide uppercase group-focus-within:text-blue-600 transition-colors">Description / Notes</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Add any additional details about this expense..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="min-h-[100px] p-4 border-gray-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base resize-none rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/20 transition-all hover:-translate-y-1 rounded-2xl bg-blue-600 hover:bg-blue-700 mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Expense"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center pb-8 opacity-60">
                        <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                            {t('trust_name')} © {new Date().getFullYear()}
                        </p>
                    </div>

                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={resetForm}>
                <DialogContent className="sm:max-w-md text-center p-8 [&>button]:hidden">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center text-gray-900 mb-2">Expense Saved!</DialogTitle>
                        <DialogDescription className="text-center text-gray-600 text-base">
                            The expense has been successfully recorded in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-8">
                        <Button onClick={resetForm} className="w-full h-12 text-lg font-semibold bg-gray-900 hover:bg-gray-800 text-white">
                            Add Another Expense
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddExpense;
