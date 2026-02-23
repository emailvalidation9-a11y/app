import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface Job {
    _id: string;
    status: string;
    total_emails: number;
    valid_emails: number;
    invalid_emails: number;
    filename?: string;
    createdAt: string;
    user?: { name: string; email: string };
}

interface Pagination {
    total: number; page: number; limit: number; pages: number;
}

export default function AdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchJobs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminApi.getJobs({ page, status: statusFilter });
            setJobs(res.data.data.jobs);
            setPagination(res.data.data.pagination);
        } catch { toast.error('Failed to load jobs'); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { fetchJobs(1); }, [fetchJobs]);

    const statusColor = (s: string) => {
        switch (s) {
            case 'completed': return 'bg-emerald-500/20 text-emerald-400';
            case 'processing': return 'bg-blue-500/20 text-blue-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'pending': return 'bg-amber-500/20 text-amber-400';
            default: return 'bg-zinc-500/20 text-zinc-400';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
        
            <div className="flex items-center gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">File</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Valid</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Invalid</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                            ) : jobs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No validation jobs found</td></tr>
                            ) : jobs.map((j) => (
                                <tr key={j._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-sm">{j.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">{j.user?.email || '—'}</p>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-muted-foreground">{j.filename || '—'}</td>
                                    <td className="p-4 font-mono font-bold text-sm">{j.total_emails?.toLocaleString() || 0}</td>
                                    <td className="p-4 font-mono text-sm text-emerald-400">{j.valid_emails?.toLocaleString() || 0}</td>
                                    <td className="p-4 font-mono text-sm text-red-400">{j.invalid_emails?.toLocaleString() || 0}</td>
                                    <td className="p-4"><Badge className={statusColor(j.status)}>{j.status}</Badge></td>
                                    <td className="p-4 text-xs text-muted-foreground">{new Date(j.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/40">
                        <p className="text-xs text-muted-foreground">
                            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchJobs(pagination.page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-medium">{pagination.page} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchJobs(pagination.page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
