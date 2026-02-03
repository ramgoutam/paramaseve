import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { useTranslation } from "react-i18next";

export default function Login() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            navigate("/dashboard");
        }
    }, [session, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // Navigation will happen via useEffect
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 gap-6">

            {/* Banner Section */}
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="bg-white rounded-2xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden">
                    <img
                        src='/banner-kn.jpg'
                        alt="Trust Banner"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>

            <Card className="w-full max-w-md shadow-xl border-orange-100 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-orange-600">
                        Login
                    </CardTitle>
                    <CardDescription className="text-center">
                        Welcome back! Please login to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="volunteer@psgkt.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-lg font-semibold h-12" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Login"}
                        </Button>
                    </form>

                    <div className="relative mt-4 mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-12 hover:bg-gray-50 border-gray-200 text-gray-700 font-medium" onClick={() => navigate("/")}>
                        Back to Public Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
