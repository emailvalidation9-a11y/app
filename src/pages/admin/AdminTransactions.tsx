import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    credits?: number;
    plan?: string;
    status: string;
    createdAt: string;
    user?: { name: string; email: string };
}

interface Pagination {
    total: number; page: number; limit: number; pages: number;
}

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminApi.getTransactions({ page });
            setTransactions(res.data.data.transactions);
            setPagination(res.data.data.pagination);
        } catch { toast.error('Failed to load transactions'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(1); }, [fetch]);

    return (
        <div className="space-y-6 animate-fade-in">


            <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Credits</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No transactions found</td></tr>
                            ) : transactions.map((t) => (
                                <tr key={t._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-sm">{t.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">{t.user?.email || '—'}</p>
                                    </td>
                                    <td className="p-4"><Badge variant="outline" className="capitalize">{t.type}</Badge></td>
                                    <td className="p-4 font-mono font-bold text-sm">${(t.amount / 100).toFixed(2)}</td>
                                    <td className="p-4 font-mono text-sm">{t.credits?.toLocaleString() || '—'}</td>
                                    <td className="p-4 text-sm">{t.plan || '—'}</td>
                                    <td className="p-4">
                                        <Badge className={t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                                            {t.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
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
