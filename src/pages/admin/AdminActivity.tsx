import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface ActivityLog {
    _id: string;
    action: string;
    target_type: string;
    target_label?: string;
    details?: Record<string, unknown>;
    ip?: string;
    created_at: string;
    admin?: { name: string; email: string };
}
interface Pagination { total: number; page: number; limit: number; pages: number; }

const ACTION_COLORS: Record<string, string> = {
    update_user: 'bg-blue-500/20 text-blue-400',
    delete_user: 'bg-red-500/20 text-red-400',
    adjust_credits: 'bg-emerald-500/20 text-emerald-400',
    set_credits: 'bg-emerald-500/20 text-emerald-400',
    reset_password: 'bg-amber-500/20 text-amber-400',
    revoke_api_key: 'bg-orange-500/20 text-orange-400',
    delete_api_key: 'bg-red-500/20 text-red-400',
};

const getBulkColor = (action: string) => action.startsWith('bulk_') ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-500/20 text-zinc-400';

export default function AdminActivity() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 30, pages: 1 });
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminApi.getActivity({ page });
            setLogs(res.data.data.logs);
            setPagination(res.data.data.pagination);
        } catch { toast.error('Failed to load activity log'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(1); }, [fetch]);

    const actionColor = (action: string) => ACTION_COLORS[action] || getBulkColor(action);
    const formatAction = (action: string) => action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
             
                <Button variant="outline" size="sm" className="gap-2" onClick={() => fetch(pagination.page)}>
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Target</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">IP</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No activity yet</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                    <td className="p-4">
                                        <Badge className={`${actionColor(log.action)} text-xs`}>{formatAction(log.action)}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-sm">{log.admin?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">{log.admin?.email || '—'}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-mono">{log.target_label || '—'}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{log.target_type}</p>
                                    </td>
                                    <td className="p-4 text-xs text-muted-foreground max-w-[200px]">
                                        {log.details && Object.keys(log.details).length > 0
                                            ? <span className="font-mono">{JSON.stringify(log.details).slice(0, 80)}{JSON.stringify(log.details).length > 80 ? '…' : ''}</span>
                                            : '—'}
                                    </td>
                                    <td className="p-4 text-xs font-mono text-muted-foreground">{log.ip || '—'}</td>
                                    <td className="p-4 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/40">
                        <p className="text-xs text-muted-foreground">{pagination.total} total entries</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetch(pagination.page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-medium">{pagination.page} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetch(pagination.page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
