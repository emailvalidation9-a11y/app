import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Search, MoreVertical, Edit, Trash2, Shield, ShieldOff, Plus, Minus,
    Loader2, ChevronLeft, ChevronRight, UserCheck, UserX, Key, Download,
    Eye, CreditCard, AlertTriangle, ChevronUp, ChevronDown,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface User {
    _id: string; name: string; email: string; credits: number;
    total_validations: number; plan: { name: string; credits_limit: number };
    role: string; is_active: boolean; createdAt: string; last_login?: string;
}
interface Pagination { total: number; page: number; limit: number; pages: number; }

const CREDIT_PRESETS = [100, 500, 1000, 5000, 10000];

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    // Dialogs / drawers
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', credits: 0, planName: '', creditsLimit: 0 });
    const [creditDialog, setCreditDialog] = useState<{ user: User; mode: 'adjust' | 'set' } | null>(null);
    const [creditAmount, setCreditAmount] = useState(0);
    const [creditReason, setCreditReason] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<User | null>(null);
    const [passwordDialog, setPasswordDialog] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [bulkAction, setBulkAction] = useState('');
    const [bulkCredits, setBulkCredits] = useState(100);
    const [bulkPlan, setBulkPlan] = useState('');
    const [bulkDialog, setBulkDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const navigate = useNavigate();

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers({ page, search, role: roleFilter, plan: planFilter, status: statusFilter, sortBy, sortOrder });
            setUsers(res.data.data.users);
            setPagination(res.data.data.pagination);
            setSelected([]);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    }, [search, roleFilter, planFilter, statusFilter, sortBy, sortOrder]);

    useEffect(() => {
        const t = setTimeout(() => fetchUsers(1), 300);
        return () => clearTimeout(t);
    }, [fetchUsers]);

    // Selection helpers
    const allSelected = users.length > 0 && users.every(u => selected.includes(u._id));
    const toggleAll = () => setSelected(allSelected ? [] : users.map(u => u._id));
    const toggleOne = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    // Sort header click
    const handleSort = (col: string) => {
        if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortOrder('desc'); }
    };
    const SortIcon = ({ col }: { col: string }) =>
        sortBy === col ? (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />) : null;

    // Navigate to dedicated profile page
    const openDetail = (u: User) => navigate(`/admin/users/${u._id}`);

    // Edit helpers
    const handleEdit = (u: User) => {
        setEditUser(u);
        setEditForm({ name: u.name, email: u.email, role: u.role, credits: u.credits, planName: u.plan.name, creditsLimit: u.plan.credits_limit });
    };
    const submitEdit = async () => {
        if (!editUser) return;
        setActionLoading(true);
        try {
            await adminApi.updateUser(editUser._id, { name: editForm.name, email: editForm.email, role: editForm.role, credits: editForm.credits, plan: { name: editForm.planName, credits_limit: editForm.creditsLimit } });
            toast.success('User updated');
            setEditUser(null);
            fetchUsers(pagination.page);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Update failed'); }
        finally { setActionLoading(false); }
    };

    // Credit helpers
    const openCreditDialog = (user: User, mode: 'adjust' | 'set') => {
        setCreditDialog({ user, mode });
        setCreditAmount(mode === 'set' ? user.credits : 0);
        setCreditReason('');
    };
    const submitCredits = async () => {
        if (!creditDialog) return;
        setActionLoading(true);
        try {
            if (creditDialog.mode === 'adjust') {
                await adminApi.adjustCredits(creditDialog.user._id, { amount: creditAmount, reason: creditReason });
                toast.success(`Credits adjusted by ${creditAmount > 0 ? '+' : ''}${creditAmount}`);
            } else {
                await adminApi.setCredits(creditDialog.user._id, { credits: creditAmount, reason: creditReason });
                toast.success(`Credits set to ${creditAmount}`);
            }
            setCreditDialog(null);
            fetchUsers(pagination.page);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    // Delete
    const submitDelete = async () => {
        if (!deleteDialog) return;
        setActionLoading(true);
        try {
            await adminApi.deleteUser(deleteDialog._id);
            toast.success('User deleted');
            setDeleteDialog(null);
            fetchUsers(pagination.page);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Delete failed'); }
        finally { setActionLoading(false); }
    };

    // Reset password
    const submitPasswordReset = async () => {
        if (!passwordDialog || newPassword.length < 6) { toast.error('Min 6 characters'); return; }
        setActionLoading(true);
        try {
            await adminApi.resetUserPassword(passwordDialog._id, newPassword);
            toast.success('Password reset successfully');
            setPasswordDialog(null);
            setNewPassword('');
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    // Toggle helpers
    const toggleActive = async (u: User) => {
        try { await adminApi.updateUser(u._id, { is_active: !u.is_active }); toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`); fetchUsers(pagination.page); }
        catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    };
    const toggleRole = async (u: User) => {
        try { await adminApi.updateUser(u._id, { role: u.role === 'admin' ? 'user' : 'admin' }); toast.success('Role updated'); fetchUsers(pagination.page); }
        catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    // Bulk submit
    const submitBulk = async () => {
        setActionLoading(true);
        try {
            await adminApi.bulkOperation(selected, bulkAction, bulkAction === 'add_credits' ? { amount: bulkCredits } : bulkAction === 'set_plan' ? { plan: bulkPlan } : undefined);
            toast.success(`Bulk action "${bulkAction}" applied to ${selected.length} users`);
            setBulkDialog(false);
            setSelected([]);
            setBulkAction('');
            fetchUsers(pagination.page);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Bulk action failed'); }
        finally { setActionLoading(false); }
    };

    // Export CSV
    const handleExport = async () => {
        try {
            const res = await adminApi.exportUsers({ search, role: roleFilter, plan: planFilter, status: statusFilter });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = 'users.csv'; a.click();
            URL.revokeObjectURL(url);
            toast.success('Users exported successfully');
        } catch { toast.error('Export failed'); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <Button onClick={handleExport} variant="outline" className="gap-2 border-border/50">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-background/50" />
                        </div>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                            <option value="">All Roles</option><option value="user">User</option><option value="admin">Admin</option>
                        </select>
                        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                            <option value="">All Plans</option><option value="Free">Free</option><option value="Starter">Starter</option><option value="Growth">Growth</option>
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                            <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Action Bar */}
            {selected.length > 0 && (
                <Card className="border-red-500/30 bg-red-500/5 backdrop-blur animate-fade-in">
                    <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-red-400">{selected.length} selected</span>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10" onClick={() => { setBulkAction('activate'); setBulkDialog(true); }}>Activate</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10" onClick={() => { setBulkAction('deactivate'); setBulkDialog(true); }}>Deactivate</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-blue-500/40 text-blue-400 hover:bg-blue-500/10" onClick={() => { setBulkAction('add_credits'); setBulkDialog(true); }}>Add Credits</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-violet-500/40 text-violet-400 hover:bg-violet-500/10" onClick={() => { setBulkAction('set_plan'); setBulkDialog(true); }}>Set Plan</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-orange-500/40 text-orange-400 hover:bg-orange-500/10" onClick={() => { setBulkAction('make_admin'); setBulkDialog(true); }}>Make Admin</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10" onClick={() => { setBulkAction('delete'); setBulkDialog(true); }}>Delete</Button>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs ml-auto" onClick={() => setSelected([])}>Clear</Button>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="p-4 w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer" onClick={() => handleSort('name')}>User <SortIcon col="name" /></th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer" onClick={() => handleSort('plan.name')}>Plan <SortIcon col="plan.name" /></th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer" onClick={() => handleSort('credits')}>Credits <SortIcon col="credits" /></th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer" onClick={() => handleSort('total_validations')}>Validations <SortIcon col="total_validations" /></th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer" onClick={() => handleSort('createdAt')}>Joined <SortIcon col="createdAt" /></th>
                                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id} className={`border-b border-border/20 hover:bg-muted/20 transition-colors ${selected.includes(u._id) ? 'bg-red-500/5' : ''}`}>
                                    <td className="p-4"><Checkbox checked={selected.includes(u._id)} onCheckedChange={() => toggleOne(u._id)} /></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">{u.name.charAt(0).toUpperCase()}</div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">{u.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><Badge variant="outline">{u.plan.name}</Badge></td>
                                    <td className="p-4">
                                        <span className="font-mono font-bold text-sm">{u.credits.toLocaleString()}</span>
                                        <span className="text-xs text-muted-foreground ml-1">/{u.plan.credits_limit.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4 font-mono text-sm">{u.total_validations.toLocaleString()}</td>
                                    <td className="p-4">{u.role === 'admin' ? <Badge className="bg-red-500/20 text-red-400">Admin</Badge> : <Badge variant="secondary">User</Badge>}</td>
                                    <td className="p-4">{u.is_active ? <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge> : <Badge className="bg-zinc-500/20 text-zinc-400">Inactive</Badge>}</td>
                                    <td className="p-4 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                <DropdownMenuItem onClick={() => openDetail(u)} className="cursor-pointer"><Eye className="h-4 w-4 mr-2" /> View Profile</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(u)} className="cursor-pointer"><Edit className="h-4 w-4 mr-2" /> Edit User</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openCreditDialog(u, 'adjust')} className="cursor-pointer"><Plus className="h-4 w-4 mr-2" /> Adjust Credits</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openCreditDialog(u, 'set')} className="cursor-pointer"><CreditCard className="h-4 w-4 mr-2" /> Set Credits</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => toggleRole(u)} className="cursor-pointer">{u.role === 'admin' ? <ShieldOff className="h-4 w-4 mr-2" /> : <Shield className="h-4 w-4 mr-2" />}{u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleActive(u)} className="cursor-pointer">{u.is_active ? <UserX className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}{u.is_active ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setPasswordDialog(u); setNewPassword(''); }} className="cursor-pointer"><Key className="h-4 w-4 mr-2" /> Reset Password</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setDeleteDialog(u)} className="cursor-pointer text-red-500 focus:text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Delete User</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/40">
                        <p className="text-xs text-muted-foreground">Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-medium">{pagination.page} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchUsers(pagination.page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Edit Dialog ── */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update user account details</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Role</Label>
                                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                                    <option value="user">User</option><option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2"><Label>Credits</Label><Input type="number" value={editForm.credits} onChange={e => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Plan</Label>
                                <select value={editForm.planName} onChange={e => setEditForm({ ...editForm, planName: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                                    <option value="Free">Free</option><option value="Starter">Starter</option><option value="Growth">Growth</option>
                                </select>
                            </div>
                            <div className="space-y-2"><Label>Credit Limit</Label><Input type="number" value={editForm.creditsLimit} onChange={e => setEditForm({ ...editForm, creditsLimit: parseInt(e.target.value) || 0 })} /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                        <Button onClick={submitEdit} disabled={actionLoading}>{actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Credit Dialog ── */}
            <Dialog open={!!creditDialog} onOpenChange={() => setCreditDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{creditDialog?.mode === 'set' ? 'Set Credits' : 'Adjust Credits'}</DialogTitle>
                        <DialogDescription>{creditDialog?.user.name} — Current balance: <strong>{creditDialog?.user.credits.toLocaleString()}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        {/* Credit Presets */}
                        <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">
                                {creditDialog?.mode === 'set' ? 'Quick Set' : 'Quick Add'}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {CREDIT_PRESETS.map(p => (
                                    <Button key={p} variant="outline" size="sm" className="h-8 text-xs border-primary/30 hover:bg-primary/10"
                                        onClick={() => setCreditAmount(creditDialog?.mode === 'set' ? p : p)}>
                                        {creditDialog?.mode === 'set' ? p.toLocaleString() : `+${p.toLocaleString()}`}
                                    </Button>
                                ))}
                                {creditDialog?.mode === 'adjust' && CREDIT_PRESETS.map(p => (
                                    <Button key={-p} variant="outline" size="sm" className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        onClick={() => setCreditAmount(-p)}>
                                        -{p.toLocaleString()}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {/* Custom amount */}
                        <div className="flex items-center gap-3">
                            {creditDialog?.mode === 'adjust' && (
                                <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => setCreditAmount(v => v - 100)}><Minus className="h-4 w-4" /></Button>
                            )}
                            <Input type="number" value={creditAmount} onChange={e => setCreditAmount(parseInt(e.target.value) || 0)} className="text-center font-mono text-lg" placeholder="Amount" />
                            {creditDialog?.mode === 'adjust' && (
                                <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => setCreditAmount(v => v + 100)}><Plus className="h-4 w-4" /></Button>
                            )}
                        </div>
                        {creditDialog?.mode === 'set' && (
                            <p className="text-xs text-muted-foreground text-center">New balance will be <strong>{creditAmount.toLocaleString()}</strong> credits</p>
                        )}
                        {creditDialog?.mode === 'adjust' && creditAmount !== 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                New balance: <strong>{Math.max(0, (creditDialog?.user.credits || 0) + creditAmount).toLocaleString()}</strong>
                            </p>
                        )}
                        <div className="space-y-2"><Label>Reason (optional)</Label><Input value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="e.g. Promo, refund, manual bonus…" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreditDialog(null)}>Cancel</Button>
                        <Button onClick={submitCredits} disabled={actionLoading || (creditDialog?.mode === 'adjust' && creditAmount === 0)}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {creditDialog?.mode === 'set' ? 'Set Credits' : 'Apply Adjustment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500"><AlertTriangle className="h-5 w-5" /> Delete User</DialogTitle>
                        <DialogDescription>Permanently delete <strong>{deleteDialog?.name}</strong> ({deleteDialog?.email}) and all their API keys. This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={actionLoading}>{actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reset Password Dialog ── */}
            <Dialog open={!!passwordDialog} onOpenChange={() => setPasswordDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Reset Password</DialogTitle>
                        <DialogDescription>Set a new password for <strong>{passwordDialog?.name}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="space-y-2"><Label>New Password</Label>
                            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialog(null)}>Cancel</Button>
                        <Button onClick={submitPasswordReset} disabled={actionLoading || newPassword.length < 6}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Bulk Dialog ── */}
            <Dialog open={bulkDialog} onOpenChange={() => setBulkDialog(false)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Bulk: {bulkAction.replace(/_/g, ' ')}</DialogTitle>
                        <DialogDescription>Apply to <strong>{selected.length}</strong> selected users.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {bulkAction === 'add_credits' && (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {CREDIT_PRESETS.map(p => <Button key={p} variant="outline" size="sm" className="h-8 text-xs" onClick={() => setBulkCredits(p)}>+{p.toLocaleString()}</Button>)}
                                </div>
                                <Input type="number" value={bulkCredits} onChange={e => setBulkCredits(parseInt(e.target.value) || 0)} placeholder="Amount" />
                            </div>
                        )}
                        {bulkAction === 'set_plan' && (
                            <select value={bulkPlan} onChange={e => setBulkPlan(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                                <option value="">Select plan…</option>
                                <option value="Free">Free</option><option value="Starter">Starter</option><option value="Growth">Growth</option>
                            </select>
                        )}
                        {bulkAction === 'delete' && <p className="text-sm text-red-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> This will permanently delete {selected.length} users and all their API keys.</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDialog(false)}>Cancel</Button>
                        <Button onClick={submitBulk} disabled={actionLoading || (bulkAction === 'set_plan' && !bulkPlan)} className={bulkAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : ''}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
