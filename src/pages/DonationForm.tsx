import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Loader2, IndianRupee, User, Phone, FileText, CreditCard, QrCode, Languages, Plus, Trash2, ShoppingBasket, CheckCircle2, Share2, Download, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { generateDonationPDF } from "@/lib/receiptGenerator";

interface GroceryItem {
    name: string;
    quantity: string;
    unit: string;
}

interface DonationData {
    donorName: string;
    amount: string;
    paymentMode: "UPI" | "CASH" | "GROCERIES";
    mobileNumber: string;
    address: string;
    notes: string;
    utrNumber?: string;
    groceryList: GroceryItem[];
}

const DonationForm = () => {
    const navigate = useNavigate();
    const { session } = useAuth();
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPaymentQr, setShowPaymentQr] = useState(false);
    const [showLangSelection, setShowLangSelection] = useState(false);

    // Success Dialog State
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<'download' | 'share' | 'preview' | null>(null);

    const [formData, setFormData] = useState<DonationData>({
        donorName: "",
        amount: "",
        paymentMode: "UPI",
        mobileNumber: "",
        address: "",
        notes: "",
        utrNumber: "",
        groceryList: [],
    });

    const [newItem, setNewItem] = useState<GroceryItem>({
        name: "",
        quantity: "",
        unit: "kg"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, paymentMode: value as any }));
    };

    const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleUnitChange = (value: string) => {
        setNewItem(prev => ({ ...prev, unit: value }));
    };

    const addItem = () => {
        if (!newItem.name || !newItem.quantity) {
            toast({
                title: "Incomplete Item",
                description: "Please enter both item name and quantity.",
                variant: "destructive",
            });
            return;
        }

        setFormData(prev => ({
            ...prev,
            groceryList: [...prev.groceryList, newItem]
        }));

        setNewItem({
            name: "",
            quantity: "",
            unit: "kg"
        });
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            groceryList: prev.groceryList.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        if (!formData.donorName || !formData.mobileNumber) {
            toast({
                title: t('missing_info_title'),
                description: t('missing_info_desc'),
                variant: "destructive",
            });
            return false;
        }

        if (formData.paymentMode !== 'GROCERIES' && !formData.amount) {
            toast({
                title: t('missing_info_title'),
                description: t('missing_info_desc'),
                variant: "destructive",
            });
            return false;
        }

        if (formData.paymentMode === 'GROCERIES' && formData.groceryList.length === 0) {
            toast({
                title: "No Items Added",
                description: "Please add at least one grocery item.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.paymentMode === 'UPI' && !formData.utrNumber) {
            toast({
                title: "Missing UTR Number",
                description: "Please enter the UTR / Reference Number for UPI payments.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleCloseSuccess = () => {
        setShowSuccessDialog(false);
        setFormData({
            donorName: "",
            amount: "",
            paymentMode: "UPI",
            mobileNumber: "",
            address: "",
            notes: "",
            utrNumber: "",
            groceryList: [],
        });
    };

    const handleSaveDonation = async () => {
        if (!validateForm()) return;
        setLoading(true);

        try {
            if (session?.user) {
                const { error: dbError } = await supabase.from('donations').insert({
                    donor_name: formData.donorName,
                    mobile_number: formData.mobileNumber,
                    address: formData.address || null,
                    amount: formData.amount ? parseFloat(formData.amount) : null,
                    payment_mode: formData.paymentMode,
                    utr_number: formData.utrNumber || null,
                    grocery_items: formData.groceryList,
                    notes: formData.notes || null,
                    created_by: session.user.id
                });

                if (dbError) throw dbError;
            }
            setShowSuccessDialog(true);
        } catch (error) {
            console.error("Save Error:", error);
            toast({
                title: t('error_title'),
                description: "Failed to save donation.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const initiateAction = (action: 'download' | 'share' | 'preview') => {
        setPendingAction(action);
        if (action === 'download') {
            setShowLangSelection(true);
        } else {
            processActionWithLanguage(i18n.language || 'en', action);
        }
    };

    const processActionWithLanguage = async (lang: string, actionType?: 'download' | 'share' | 'preview') => {
        setShowLangSelection(false);
        const currentAction = actionType || pendingAction;
        setLoading(true);

        try {
            const result = await generateDonationPDF(formData, lang, t, currentAction !== 'download');

            if (currentAction === 'preview' && result instanceof File) {
                const url = URL.createObjectURL(result);
                window.open(url, '_blank');
            } else if (currentAction === 'share' && result instanceof File) {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Donation Receipt',
                        text: `Donation Receipt for ${formData.donorName}`,
                        files: [result],
                    });
                } else {
                    toast({ title: "Sharing not supported", variant: "destructive" });
                }
            }
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast({
                title: t('error_title'),
                description: t('error_desc'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto flex flex-col w-full">
            <div className="flex-1 p-4 md:p-6 flex flex-col items-center animate-in fade-in duration-1000">

                <div className="w-full max-w-7xl space-y-6 relative z-10">

                    {/* Header Section */}
                    <div className="text-center space-y-3 py-2">
                        <div className="w-full flex items-center justify-center">
                            <img src="/banner-kn.jpg" alt="Banner" className="w-full max-w-4xl h-auto object-contain rounded-lg shadow-lg" />
                        </div>

                        <div className="animate-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-backwards">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 drop-shadow-sm">
                                {t('app_title')}
                            </h1>
                        </div>
                    </div>

                    {/* Form Card */}
                    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-2xl rounded-3xl overflow-hidden ring-1 ring-gray-900/5 animate-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-backwards">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 py-3 px-4 md:px-6">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <CardTitle className="text-xl text-gray-900 font-bold">{t('donor_details')}</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6 p-4 md:p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3 group">
                                    <Label htmlFor="donorName" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                                        <User className="h-4 w-4" />
                                        {t('donor_name')} <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="donorName"
                                            name="donorName"
                                            placeholder={t('enter_full_name')}
                                            value={formData.donorName}
                                            onChange={handleInputChange}
                                            required
                                            className="h-12 px-4 border-gray-200 bg-white focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base rounded-xl shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 group">
                                    <Label htmlFor="mobileNumber" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                                        <Phone className="h-4 w-4" />
                                        {t('mobile_number')} <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            placeholder={t('enter_mobile')}
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            type="tel"
                                            required
                                            className="h-12 px-4 border-gray-200 bg-white focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base rounded-xl shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 group">
                                    <Label htmlFor="address" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                                        <FileText className="h-4 w-4" />
                                        Address
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="address"
                                            name="address"
                                            placeholder="Enter address (optional)"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="h-12 px-4 border-gray-200 bg-white focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base rounded-xl shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100/50 space-y-6">
                                <div className="grid gap-8 md:grid-cols-2">
                                    {formData.paymentMode !== 'GROCERIES' && (
                                        <div className="space-y-3 group">
                                            <Label htmlFor="amount" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                                                <IndianRupee className="h-4 w-4" />
                                                {t('amount')} <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative group/input">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-orange-100 text-orange-600 rounded-md p-1">
                                                    <IndianRupee className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    id="amount"
                                                    name="amount"
                                                    placeholder="0.00"
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="h-14 pl-14 border-orange-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-xl text-gray-800 rounded-xl shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className={`${formData.paymentMode === 'GROCERIES' ? 'col-span-2' : ''} space-y-3 group`}>
                                        <Label htmlFor="paymentMode" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                                            <CreditCard className="h-4 w-4" />
                                            {t('donation_type')} <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Select value={formData.paymentMode} onValueChange={handleSelectChange}>
                                                    <SelectTrigger className="h-14 px-4 border-gray-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base rounded-xl shadow-sm">
                                                        <SelectValue placeholder={t('select_mode')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UPI">{t('mode_upi')}</SelectItem>
                                                        <SelectItem value="CASH">{t('mode_cash')}</SelectItem>
                                                        <SelectItem value="GROCERIES">{t('mode_groceries')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {formData.paymentMode === 'UPI' && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="icon" className="h-14 w-14 rounded-xl bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 shadow-sm shrink-0">
                                                            <QrCode className="h-6 w-6" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6">
                                                        <div className="text-center space-y-4">
                                                            <h3 className="text-lg font-bold text-gray-900">Scan to Pay</h3>
                                                            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 inline-block">
                                                                <img src="/qr-code.png" alt="Payment QR Code" className="w-64 h-64 object-contain" />
                                                            </div>
                                                            <p className="text-sm text-gray-500">Scan this QR code using any UPI app</p>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {formData.paymentMode === 'GROCERIES' && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                        <div className="space-y-3 group">
                                            <Label className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                                                <ShoppingBasket className="h-4 w-4" />
                                                Add Grocery Items <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                                                <div className="relative flex-grow">
                                                    <Input
                                                        name="name"
                                                        placeholder="Item Name (e.g. Rice)"
                                                        value={newItem.name}
                                                        onChange={handleNewItemChange}
                                                        className="h-10 md:h-14 bg-white border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl shadow-sm pl-4 text-sm md:text-base"
                                                    />
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <div className="relative w-20 md:w-28">
                                                        <Input
                                                            name="quantity"
                                                            type="number"
                                                            placeholder="Qty"
                                                            value={newItem.quantity}
                                                            onChange={handleNewItemChange}
                                                            className="h-10 md:h-14 bg-white border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl shadow-sm text-center text-sm md:text-base"
                                                        />
                                                    </div>
                                                    <Select value={newItem.unit} onValueChange={handleUnitChange}>
                                                        <SelectTrigger className="w-20 md:w-28 h-10 md:h-14 bg-white border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl shadow-sm text-sm md:text-base">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="kg">kg</SelectItem>
                                                            <SelectItem value="g">g</SelectItem>
                                                            <SelectItem value="L">L</SelectItem>
                                                            <SelectItem value="ml">ml</SelectItem>
                                                            <SelectItem value="pcs">pcs</SelectItem>
                                                            <SelectItem value="bags">bags</SelectItem>
                                                            <SelectItem value="boxes">boxes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        onClick={addItem}
                                                        className="h-10 w-10 md:h-14 md:w-14 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition-all active:scale-95 items-center justify-center shrink-0"
                                                    >
                                                        <Plus className="h-5 w-5 md:h-6 md:w-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {formData.groceryList.length > 0 && (
                                            <div className="grid gap-2 mt-2">
                                                {formData.groceryList.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-100 group animate-in slide-in-from-left-2 duration-300"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-gray-400 w-5">#{index + 1}</span>
                                                            <p className="font-medium text-gray-700 text-sm">{item.name}</p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="px-2 py-1 bg-white text-gray-600 text-xs font-medium rounded border border-gray-100">
                                                                {item.quantity} {item.unit}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeItem(index)}
                                                                className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.paymentMode === 'UPI' && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                        <Label htmlFor="utrNumber" className="text-gray-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2 mb-3 group-focus-within:text-orange-600 transition-colors">
                                            <FileText className="h-4 w-4" />
                                            UTR / Reference Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="utrNumber"
                                            name="utrNumber"
                                            placeholder="Enter UPI Reference Number (UTR)"
                                            value={formData.utrNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="h-14 px-4 border-gray-200 bg-white focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base rounded-xl shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 group">
                                <Label htmlFor="notes" className="text-gray-700 font-bold text-sm tracking-wide uppercase group-focus-within:text-orange-600 transition-colors">{t('notes')}</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    placeholder={t('notes_placeholder')}
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="min-h-[120px] p-4 border-gray-200 bg-white focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base resize-none rounded-xl shadow-sm"
                                />
                            </div>

                            <Button
                                onClick={handleSaveDonation}
                                className="w-full h-16 text-lg font-bold shadow-xl shadow-orange-900/10 hover:shadow-2xl hover:shadow-orange-900/20 transition-all hover:-translate-y-1 rounded-2xl bg-orange-600 hover:bg-orange-700"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-6 w-6" />
                                        Save Donation
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Language Selection Dialog */}
                    <Dialog open={showLangSelection} onOpenChange={setShowLangSelection}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Languages className="h-5 w-5 text-orange-600" />
                                    Select Receipt Language
                                </DialogTitle>
                                <DialogDescription>
                                    Choose the language for the PDF receipt.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 py-4">
                                <Button
                                    onClick={() => processActionWithLanguage('kn')}
                                    className="h-14 text-lg font-bold bg-white text-gray-900 border-2 border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 justify-start px-6"
                                >
                                    <span className="mr-2 text-2xl">ಕ</span>
                                    Kannada (ಕನ್ನಡ)
                                </Button>
                                <Button
                                    onClick={() => processActionWithLanguage('en')}
                                    className="h-14 text-lg font-bold bg-white text-gray-900 border-2 border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 justify-start px-6"
                                >
                                    <span className="mr-2 text-xl font-serif">A</span>
                                    English
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Success Dialog */}
                    <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccess}>
                        <DialogContent className="sm:max-w-md text-center p-8 [&>button]:hidden">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-in zoom-in duration-300">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-center text-gray-900 mb-2">Donation Successful!</DialogTitle>
                                <DialogDescription className="text-center text-gray-600 text-base">
                                    The donation has been recorded and the receipt is ready.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 mt-6">
                                <Button onClick={() => initiateAction('preview')} variant="outline" className="w-full h-12 text-lg font-semibold border-2 gap-2 hover:bg-blue-50 text-blue-700 border-blue-100">
                                    <Eye className="h-5 w-5" />
                                    Preview Receipt
                                </Button>
                                <Button onClick={() => initiateAction('download')} className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700 gap-2">
                                    <Download className="h-5 w-5" />
                                    Download Receipt
                                </Button>
                                <Button onClick={() => initiateAction('share')} variant="outline" className="w-full h-12 text-lg font-semibold border-2 gap-2">
                                    <Share2 className="h-5 w-5" />
                                    Share Receipt
                                </Button>
                                <Button onClick={handleCloseSuccess} variant="ghost" className="w-full h-12 text-gray-500 hover:text-gray-900">
                                    Close & New Donation
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Footer */}
                    <div className="text-center pb-8 opacity-60">
                        <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                            {t('trust_name')} © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationForm;
