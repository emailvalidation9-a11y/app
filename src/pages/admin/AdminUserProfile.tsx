import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    ArrowLeft, Edit, Save, X, Key, Activity, CreditCard, Shield, ShieldOff,
    UserCheck, UserX, Trash2, Loader2, Plus, Minus, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    credits: number;
    total_validations: number;
    plan: { name: string; credits_limit: number; renewal_date?: string };
    role: string;
    is_active: boolean;
    is_verified: boolean;
    createdAt: string;
    last_login?: string;
}
interface ApiKey {
    _id: string; name: string; key_preview: string; is_active: boolean;
    usage_count: number; last_used_at?: string; created_at: string;
}
interface Job {
    _id: string; status: string; total_emails: number; valid_emails: number;
    invalid_emails: number; filename?: string; createdAt: string;
}
interface Transaction {
    _id: string; type: string; description: string; status: string;
    amount: { paid: number; currency: string }; credits: { added: number; deducted: number; after: number };
    created_at: string;
}

const CREDIT_PRESETS = [100, 500, 1000, 5000, 10000];

export default function AdminUserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit mode
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', credits: 0, planName: '', creditsLimit: 0 });
    const [saveLoading, setSaveLoading] = useState(false);

    // Dialogs
    const [creditDialog, setCreditDialog] = useState<'adjust' | 'set' | null>(null);
    const [creditAmount, setCreditAmount] = useState(0);
    const [creditReason, setCreditReason] = useState('');
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadProfile = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await adminApi.getUser(id);
            const data = res.data.data;
            setProfile(data.user);
            setApiKeys(data.apiKeys || []);
            setJobs(data.jobs || []);
            setTransactions(data.transactions || []);
        } catch {
            toast.error('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, [id]);

    const startEdit = () => {
        if (!profile) return;
        setEditForm({
            name: profile.name,
            email: profile.email,
            role: profile.role,
            credits: profile.credits,
            planName: profile.plan.name,
            creditsLimit: profile.plan.credits_limit,
        });
        setEditing(true);
    };

    const saveEdit = async () => {
        if (!profile) return;
        setSaveLoading(true);
        try {
            await adminApi.updateUser(profile._id, {
                name: editForm.name,
                email: editForm.email,
                role: editForm.role,
                credits: editForm.credits,
                plan: { name: editForm.planName, credits_limit: editForm.creditsLimit },
            });
            toast.success('Profile updated successfully');
            setEditing(false);
            loadProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Update failed');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCredits = async () => {
        if (!profile) return;
        setActionLoading(true);
        try {
            if (creditDialog === 'adjust') {
                await adminApi.adjustCredits(profile._id, { amount: creditAmount, reason: creditReason });
                toast.success(`Credits adjusted by ${creditAmount > 0 ? '+' : ''}${creditAmount}`);
            } else {
                await adminApi.setCredits(profile._id, { credits: creditAmount, reason: creditReason });
                toast.success(`Credits set to ${creditAmount}`);
            }
            setCreditDialog(null);
            loadProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!profile || newPassword.length < 6) { toast.error('Min 6 characters'); return; }
        setActionLoading(true);
        try {
            await adminApi.resetUserPassword(profile._id, newPassword);
            toast.success('Password reset successfully');
            setPasswordDialog(false);
            setNewPassword('');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!profile) return;
        try {
            await adminApi.updateUser(profile._id, { is_active: !profile.is_active });
            toast.success(`User ${profile.is_active ? 'deactivated' : 'activated'}`);
            loadProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        }
    };

    const handleToggleRole = async () => {
        if (!profile) return;
        try {
            await adminApi.updateUser(profile._id, { role: profile.role === 'admin' ? 'user' : 'admin' });
            toast.success('Role updated');
            loadProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        try {
            await adminApi.revokeApiKey(keyId);
            toast.success('API key revoked');
            loadProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        }
    };

    const handleDeleteUser = async () => {
        if (!profile) return;
        setActionLoading(true);
        try {
            await adminApi.deleteUser(profile._id);
            toast.success('User deleted');
            navigate('/admin/users');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Delete failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-semibold">User not found</p>
                <Button asChild variant="outline" className="mt-4"><Link to="/admin/users"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Users</Link></Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="h-10 w-10 border-border/50">
                        <Link to="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-2xl font-extrabold text-primary ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.15)]">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">{profile.name}</h1>
                        <p className="text-sm text-muted-foreground font-mono">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline">{profile.plan.name}</Badge>
                            {profile.role === 'admin' && <Badge className="bg-red-500/20 text-red-400">Admin</Badge>}
                            {profile.is_active ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                            ) : (
                                <Badge className="bg-zinc-500/20 text-zinc-400">Inactive</Badge>
                            )}
                            {profile.is_verified && <Badge className="bg-blue-500/20 text-blue-400">Verified</Badge>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => loadProfile()}>
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </Button>
                    {!editing ? (
                        <Button size="sm" className="gap-2" onClick={startEdit}>
                            <Edit className="h-3.5 w-3.5" /> Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditing(false)}>
                                <X className="h-3.5 w-3.5" /> Cancel
                            </Button>
                            <Button size="sm" className="gap-2" onClick={saveEdit} disabled={saveLoading}>
                                {saveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Profile Details */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-6">
                            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Account Details
                            </h2>

                            {editing ? (
                                <div className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email Address</Label>
                                            <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Plan</Label>
                                            <select value={editForm.planName} onChange={e => setEditForm({ ...editForm, planName: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                                                <option value="Free">Free</option>
                                                <option value="Starter">Starter</option>
                                                <option value="Growth">Growth</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Credit Limit</Label>
                                            <Input type="number" value={editForm.creditsLimit} onChange={e => setEditForm({ ...editForm, creditsLimit: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Credits Balance</Label>
                                        <Input type="number" value={editForm.credits} onChange={e => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    {[
                                        { label: 'Full Name', value: profile.name },
                                        { label: 'Email', value: profile.email },
                                        { label: 'Role', value: profile.role },
                                        { label: 'Plan', value: profile.plan.name },
                                        { label: 'Credit Limit', value: profile.plan.credits_limit.toLocaleString() },
                                        { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                        { label: 'Last Login', value: profile.last_login ? new Date(profile.last_login).toLocaleString() : 'Never' },
                                        { label: 'Verified', value: profile.is_verified ? 'Yes' : 'No' },
                                    ].map(row => (
                                        <div key={row.label} className="flex flex-col gap-0.5 py-2 border-b border-border/20">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{row.label}</span>
                                            <span className="font-semibold">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* API Keys */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-6">
                            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                API Keys ({apiKeys.length})
                            </h2>
                            {apiKeys.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No API keys created yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {apiKeys.map(k => (
                                        <div key={k._id} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/30">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Key className="h-4 w-4 text-violet-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm">{k.name}</p>
                                                    <p className="text-xs font-mono text-muted-foreground">{k.key_preview}… · {k.usage_count.toLocaleString()} uses · Last used: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {k.is_active ? (
                                                    <>
                                                        <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px]">Active</Badge>
                                                        <Button variant="outline" size="sm" className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                            onClick={() => handleRevokeKey(k._id)}>Revoke</Button>
                                                    </>
                                                ) : (
                                                    <Badge className="bg-zinc-500/15 text-zinc-400 text-[10px]">Revoked</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Jobs */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-6">
                            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                Recent Validation Jobs ({jobs.length})
                            </h2>
                            {jobs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No validation jobs yet</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/40">
                                                <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">File</th>
                                                <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                                                <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Valid</th>
                                                <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Invalid</th>
                                                <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                                <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobs.map(j => (
                                                <tr key={j._id} className="border-b border-border/20 hover:bg-muted/10">
                                                    <td className="py-3 font-mono text-xs text-muted-foreground">{j.filename || '—'}</td>
                                                    <td className="py-3 font-mono font-bold">{j.total_emails.toLocaleString()}</td>
                                                    <td className="py-3 font-mono text-emerald-400">{j.valid_emails.toLocaleString()}</td>
                                                    <td className="py-3 font-mono text-red-400">{j.invalid_emails.toLocaleString()}</td>
                                                    <td className="py-3">
                                                        <Badge className={j.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : j.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>{j.status}</Badge>
                                                    </td>
                                                    <td className="py-3 text-xs text-muted-foreground">{new Date(j.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-6">
                            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                Recent Transactions ({transactions.length})
                            </h2>
                            {transactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No transactions yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map(t => (
                                        <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm">{t.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <p className="font-mono font-bold text-sm">${(t.amount.paid / 100).toFixed(2)}</p>
                                                <Badge className={t.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 text-[10px]' : 'bg-amber-500/20 text-amber-400 text-[10px]'}>{t.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-5">
                    {/* Stats */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-5 space-y-4">
                            <h3 className="font-bold text-sm mb-1">Account Stats</h3>
                            {[
                                { label: 'Credits Balance', value: profile.credits.toLocaleString(), color: 'text-primary' },
                                { label: 'Credit Limit', value: profile.plan.credits_limit.toLocaleString(), color: 'text-muted-foreground' },
                                { label: 'Total Validations', value: profile.total_validations.toLocaleString(), color: 'text-cyan-400' },
                                { label: 'API Keys', value: apiKeys.length.toString(), color: 'text-violet-400' },
                                { label: 'Jobs Run', value: jobs.length.toString(), color: 'text-amber-400' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                                    <span className="text-xs text-muted-foreground">{s.label}</span>
                                    <span className={`font-mono font-bold text-sm ${s.color}`}>{s.value}</span>
                                </div>
                            ))}

                            {/* Credit usage bar */}
                            <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Credit Usage</span>
                                    <span>{Math.round((1 - profile.credits / Math.max(profile.plan.credits_limit, 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, Math.round((1 - profile.credits / Math.max(profile.plan.credits_limit, 1)) * 100))}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Actions */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-5">
                            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Credits</h3>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-3">Quick Add</p>
                                <div className="flex flex-wrap gap-2">
                                    {[100, 500, 1000, 5000].map(p => (
                                        <Button key={p} variant="outline" size="sm" className="h-8 text-xs border-primary/30 hover:bg-primary/10"
                                            onClick={async () => {
                                                try {
                                                    await adminApi.adjustCredits(profile._id, { amount: p, reason: 'Admin quick assign' });
                                                    toast.success(`+${p.toLocaleString()} credits added`);
                                                    loadProfile();
                                                } catch { toast.error('Failed'); }
                                            }}>
                                            +{p.toLocaleString()}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => { setCreditDialog('adjust'); setCreditAmount(0); setCreditReason(''); }}>
                                        <Plus className="h-3.5 w-3.5" /> Adjust
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => { setCreditDialog('set'); setCreditAmount(profile.credits); setCreditReason(''); }}>
                                        <Activity className="h-3.5 w-3.5" /> Set Balance
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Actions */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-5 space-y-2">
                            <h3 className="font-bold text-sm mb-4">Account Actions</h3>
                            <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm"
                                onClick={handleToggleRole}>
                                {profile.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                {profile.role === 'admin' ? 'Remove Admin Role' : 'Grant Admin Role'}
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm"
                                onClick={handleToggleActive}>
                                {profile.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                {profile.is_active ? 'Deactivate Account' : 'Activate Account'}
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm"
                                onClick={() => { setPasswordDialog(true); setNewPassword(''); }}>
                                <Key className="h-4 w-4" /> Reset Password
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm text-red-500 border-red-500/20 hover:bg-red-500/10"
                                onClick={() => setDeleteDialog(true)}>
                                <Trash2 className="h-4 w-4" /> Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Credit Dialog ── */}
            <Dialog open={!!creditDialog} onOpenChange={() => setCreditDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{creditDialog === 'set' ? 'Set Credits' : 'Adjust Credits'}</DialogTitle>
                        <DialogDescription>Current balance: <strong>{profile.credits.toLocaleString()}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex flex-wrap gap-2">
                            {CREDIT_PRESETS.map(p => (
                                <Button key={p} variant="outline" size="sm" className="h-8 text-xs border-primary/30 hover:bg-primary/10"
                                    onClick={() => setCreditAmount(creditDialog === 'set' ? p : p)}>
                                    {creditDialog === 'set' ? p.toLocaleString() : `+${p.toLocaleString()}`}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            {creditDialog === 'adjust' && (
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setCreditAmount(v => v - 100)}><Minus className="h-4 w-4" /></Button>
                            )}
                            <Input type="number" value={creditAmount} onChange={e => setCreditAmount(parseInt(e.target.value) || 0)} className="text-center font-mono text-lg" />
                            {creditDialog === 'adjust' && (
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setCreditAmount(v => v + 100)}><Plus className="h-4 w-4" /></Button>
                            )}
                        </div>
                        {creditDialog === 'adjust' && creditAmount !== 0 && (
                            <p className="text-xs text-center text-muted-foreground">New balance: <strong>{Math.max(0, profile.credits + creditAmount).toLocaleString()}</strong></p>
                        )}
                        {creditDialog === 'set' && (
                            <p className="text-xs text-center text-muted-foreground">New balance will be set to <strong>{creditAmount.toLocaleString()}</strong></p>
                        )}
                        <div className="space-y-2">
                            <Label>Reason (optional)</Label>
                            <Input value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="e.g. Promo, refund, manual bonus…" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreditDialog(null)}>Cancel</Button>
                        <Button onClick={handleCredits} disabled={actionLoading || (creditDialog === 'adjust' && creditAmount === 0)}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {creditDialog === 'set' ? 'Set Credits' : 'Apply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Password Dialog ── */}
            <Dialog open={passwordDialog} onOpenChange={() => setPasswordDialog(false)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>Set a new password for <strong>{profile.name}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancel</Button>
                        <Button onClick={handlePasswordReset} disabled={actionLoading || newPassword.length < 6}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={deleteDialog} onOpenChange={() => setDeleteDialog(false)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500"><AlertTriangle className="h-5 w-5" /> Delete Account</DialogTitle>
                        <DialogDescription>Permanently delete <strong>{profile.name}</strong> ({profile.email}) and all their API keys. This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
