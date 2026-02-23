import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users, Activity, CreditCard, TrendingUp, Shield, UserCheck,
    ArrowRight, Loader2,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';

interface Stats {
    overview: {
        totalUsers: number;
        activeUsers: number;
        adminUsers: number;
        totalJobs: number;
        completedJobs: number;
        totalTransactions: number;
        totalRevenue: number;
    };
    planDistribution: Record<string, number>;
    recentUsers: Array<{
        _id: string;
        name: string;
        email: string;
        plan: { name: string };
        role: string;
        createdAt: string;
        is_active: boolean;
    }>;
    recentJobs: Array<{
        _id: string;
        status: string;
        total_emails: number;
        createdAt: string;
        user?: { name: string; email: string };
    }>;
}

export default function AdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getStats().then((res) => {
            setStats(res.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return <p className="text-muted-foreground">Failed to load admin data.</p>;

    const cards = [
        { label: 'Total Users', value: stats.overview.totalUsers, icon: Users, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5' },
        { label: 'Active Users', value: stats.overview.activeUsers, icon: UserCheck, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
        { label: 'Admin Accounts', value: stats.overview.adminUsers, icon: Shield, color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5' },
        { label: 'Total Jobs', value: stats.overview.totalJobs, icon: Activity, color: 'text-violet-400', bg: 'from-violet-500/20 to-violet-500/5' },
        { label: 'Completed Jobs', value: stats.overview.completedJobs, icon: TrendingUp, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5' },
        { label: 'Transactions', value: stats.overview.totalTransactions, icon: CreditCard, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-500/5' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
          

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((c) => (
                    <Card key={c.label} className="border-border/40 bg-card/50 backdrop-blur">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center ring-1 ring-white/5`}>
                                <c.icon className={`h-5 w-5 ${c.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold tracking-tight">{c.value.toLocaleString()}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Plan Distribution */}
            <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Plan Distribution</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.planDistribution).map(([plan, count]) => (
                            <div key={plan} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/40">
                                <Badge variant={plan === 'Growth' ? 'default' : 'secondary'}>{plan}</Badge>
                                <span className="text-lg font-bold">{count}</span>
                                <span className="text-xs text-muted-foreground">users</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Users + Recent Jobs */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/40 bg-card/50 backdrop-blur">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Recent Users</h3>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link to="/admin/users">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {stats.recentUsers.map((u) => (
                                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{u.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge variant="outline" className="text-[10px]">{u.plan.name}</Badge>
                                        {u.role === 'admin' && <Badge className="bg-red-500/20 text-red-400 text-[10px]">Admin</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Recent Jobs</h3>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link to="/admin/jobs">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {stats.recentJobs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No validation jobs yet</p>
                            ) : (
                                stats.recentJobs.map((j) => (
                                    <div key={j._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{j.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-muted-foreground">{j.total_emails} emails</p>
                                        </div>
                                        <Badge variant={j.status === 'completed' ? 'default' : 'secondary'}>{j.status}</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
