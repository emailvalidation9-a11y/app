import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    Search, Loader2, ChevronLeft, ChevronRight, Trash2, ShieldOff, AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface ApiKey {
    _id: string;
    name: string;
    key_preview: string;
    is_active: boolean;
    usage_count: number;
    rate_limit_per_minute: number;
    last_used_at?: string;
    created_at: string;
    user_id?: { name: string; email: string };
}
interface Pagination { total: number; page: number; limit: number; pages: number; }

export default function AdminApiKeys() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetch = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminApi.getApiKeys({ page, search, status: statusFilter });
            setKeys(res.data.data.keys);
            setPagination(res.data.data.pagination);
        } catch { toast.error('Failed to load API keys'); }
        finally { setLoading(false); }
    }, [search, statusFilter]);

    useEffect(() => {
        const t = setTimeout(() => fetch(1), 300);
        return () => clearTimeout(t);
    }, [fetch]);

    const handleRevoke = async () => {
        if (!revokeTarget) return;
        setActionLoading(true);
        try {
            await adminApi.revokeApiKey(revokeTarget._id);
            toast.success('API key revoked');
            setRevokeTarget(null);
            fetch(pagination.page);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        try {
            await adminApi.deleteApiKey(deleteTarget._id);
            toast.success('API key deleted');
            setDeleteTarget(null);
            fetch(pagination.page);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
          

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by user or key name…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-background/50" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                    <option value="">All Status</option><option value="active">Active</option><option value="inactive">Revoked</option>
                </select>
            </div>

            <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Name</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Owner</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Usage</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rate Limit</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Used</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                            ) : keys.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No API keys found</td></tr>
                            ) : keys.map((k) => (
                                <tr key={k._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                    <td className="p-4 font-semibold text-sm">{k.name}</td>
                                    <td className="p-4">
                                        <p className="font-semibold text-sm">{k.user_id?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">{k.user_id?.email || '—'}</p>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-muted-foreground">{k.key_preview}…</td>
                                    <td className="p-4 font-mono text-sm">{k.usage_count.toLocaleString()}</td>
                                    <td className="p-4 text-sm">{k.rate_limit_per_minute}/min</td>
                                    <td className="p-4 text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}</td>
                                    <td className="p-4">
                                        {k.is_active
                                            ? <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                                            : <Badge className="bg-zinc-500/20 text-zinc-400">Revoked</Badge>}
                                    </td>
                                    <td className="p-4 text-xs text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {k.is_active && (
                                                <Button variant="outline" size="sm" className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                    onClick={() => setRevokeTarget(k)}>
                                                    <ShieldOff className="h-3.5 w-3.5 mr-1" /> Revoke
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                onClick={() => setDeleteTarget(k)}>
                                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/40">
                        <p className="text-xs text-muted-foreground">
                            {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetch(pagination.page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-medium">{pagination.page} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetch(pagination.page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Revoke Dialog */}
            <Dialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-500"><ShieldOff className="h-5 w-5" /> Revoke API Key</DialogTitle>
                        <DialogDescription>Revoke <strong>{revokeTarget?.name}</strong> belonging to <strong>{revokeTarget?.user_id?.email}</strong>? The key will stop working immediately but can be referenced in logs.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRevoke} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Revoke Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500"><AlertTriangle className="h-5 w-5" /> Delete API Key</DialogTitle>
                        <DialogDescription>Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
