
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pen, Trash2, Shield, User, RefreshCw, KeyRound } from "lucide-react";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
    id: string;
    full_name: string;
    email?: string; // We might need to fetch this from a function or different query if not in profiles
    phone: string;
    role: 'admin' | 'manager' | 'volunteer';
    created_at: string;
}

export default function UserManagement() {
    const { role } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Form States
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // Only for creation
    const [phone, setPhone] = useState("");
    const [userRole, setUserRole] = useState<'admin' | 'manager' | 'volunteer'>('volunteer');
    const [actionLoading, setActionLoading] = useState(false);

    // Password Reset State
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [resetPassword, setResetPassword] = useState("");
    const [userToReset, setUserToReset] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Note: In real Supabase, getting email requires linking auth.users. 
            // For now, let's assume we can get profile data. We might need an Edge Function for "list users with emails"
            // Or we rely on what's in 'profiles'. If email isn't in profiles, we might just show names for now.
            // Let's assume we added email to profiles trigger for newer users, or we just manage profile data.
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as UserProfile[]);
        } catch (error: any) {
            toast({
                title: "Error fetching users",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const { data, error } = await supabase.rpc('create_new_user', {
                email: email,
                password: password,
                full_name: fullName,
                phone: phone,
                user_role: userRole
            });

            if (error) throw error;

            toast({
                title: "User Created",
                description: "The user has been created successfully. They can now log in.",
            });

            setIsDialogOpen(false);
            fetchUsers();

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone: phone, role: userRole })
                .eq('id', selectedUser.id);

            if (error) throw error;

            toast({ title: "User updated successfully" });
            fetchUsers();
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            const { error } = await supabase.rpc('delete_user', { target_user_id: userId });

            if (error) throw error;

            fetchUsers();
            toast({ title: "User deleted successfully" });
        } catch (error: any) {
            toast({ title: "Error deleting user", description: error.message, variant: "destructive" });
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToReset) return;
        setActionLoading(true);
        try {
            const { error } = await supabase.rpc('admin_reset_password', {
                target_user_id: userToReset.id,
                new_password: resetPassword
            });
            if (error) throw error;
            toast({ title: "Password updated successfully" });
            setIsResetPasswordOpen(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setActionLoading(false);
            setResetPassword("");
        }
    };

    const openCreateDialog = () => {
        setIsEditMode(false);
        setSelectedUser(null);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setUserRole("volunteer");
        setIsDialogOpen(true);
    };

    const openEditDialog = (user: UserProfile) => {
        setIsEditMode(true);
        setSelectedUser(user);
        setFullName(user.full_name);
        setEmail(user.email || ""); // We might not have this
        setPhone(user.phone || "");
        setUserRole(user.role);
        setIsDialogOpen(true);
    };

    if (role !== 'admin') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Admins Only.</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage admins, managers, and volunteers.</p>
                </div>
                <Button onClick={openCreateDialog} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users and their roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-600" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium text-gray-900">
                                            {user.full_name || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`capitalize ${user.role === 'admin' ? 'border-red-200 text-red-700 bg-red-50' :
                                                user.role === 'manager' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                                    'border-green-200 text-green-700 bg-green-50'
                                                }`}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.phone || "-"}</TableCell>
                                        <TableCell className="text-gray-500 text-xs">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => { setUserToReset(user); setIsResetPasswordOpen(true); }} className="h-8 w-8 text-gray-500 hover:text-blue-600" title="Reset Password">
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} className="h-8 w-8 text-gray-500 hover:text-orange-600">
                                                    <Pen className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? "Update user details and role." : "Create a new user. They will be asked to change password on login."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={isEditMode ? (e) => { e.preventDefault(); handleUpdateUser(); } : handleCreateUser} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>

                        {!isEditMode && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Initial Password</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={userRole} onValueChange={(val: any) => setUserRole(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="volunteer">Volunteer</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={actionLoading} className="bg-orange-600 hover:bg-orange-700">
                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditMode ? "Save Changes" : "Create User")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for {userToReset?.full_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required minLength={6} />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

