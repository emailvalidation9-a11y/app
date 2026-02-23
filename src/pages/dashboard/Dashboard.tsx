import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { validationApi } from '@/services/api';
import {
  CheckCircle,
  XCircle,
  Mail,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  recentJobs: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await validationApi.getJobs(1, 5);
      const jobs = response.data.data.jobs;

      const totalValidations = user?.total_validations || 0;
      const validCount = jobs.reduce((acc: number, job: any) => acc + (job.valid_count || 0), 0);
      const invalidCount = jobs.reduce((acc: number, job: any) => acc + (job.invalid_count || 0), 0);

      setStats({
        totalValidations,
        validCount,
        invalidCount,
        recentJobs: jobs,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const creditUsagePercentage = user?.plan?.credits_limit
    ? Math.round(((user.plan.credits_limit - (user.credits || 0)) / user.plan.credits_limit) * 100)
    : 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      queued: 'secondary',
      processing: 'default',
      completed: 'outline',
      failed: 'destructive',
      cancelled: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Section */}
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's your email validation overview at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative">
        {/* Glow Element Behind Stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-32 bg-primary/5 blur-[120px] rounded-full pointer-events-none w-full h-full" />

        <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-xl hover:shadow-[0_0_30px_rgba(var(--primary),0.15)] hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Emails Verified</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{stats?.totalValidations?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground/80 mt-1 font-medium">All time total</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-card/40 backdrop-blur-xl shadow-xl hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Deliverable</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{stats?.validCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground/80 mt-1 font-medium">Safe to send</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-card/40 backdrop-blur-xl shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Undeliverable</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{stats?.invalidCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground/80 mt-1 font-medium">Bounces prevented</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-card/40 backdrop-blur-xl shadow-xl hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30 mb-2 relative z-10">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Credits Left</CardTitle>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-foreground">{user?.credits?.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={creditUsagePercentage} className="h-1.5 flex-1 bg-muted/50" />
              <span className="text-[10px] font-bold text-muted-foreground">{creditUsagePercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/20 backdrop-blur-md hover:bg-card/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Single Verify
            </CardTitle>
            <CardDescription>Validate a single email address in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]">
              <Link to="/validate/single">
                Verify Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/20 backdrop-blur-md hover:bg-card/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" /> Bulk Verify
            </CardTitle>
            <CardDescription>Upload a CSV list to validate thousands of emails</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="lg" className="w-full hover:bg-primary/5 hover:text-primary transition-colors border-dashed border-2 hover:border-primary/50">
              <Link to="/validate/bulk">
                Upload CSV
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl relative overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Validations</CardTitle>
              <CardDescription>Your latest email verification jobs</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:bg-primary/10 hover:text-primary text-xs tracking-wider uppercase font-semibold">
              <Link to="/history">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="divide-y divide-border/40">
              {stats.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-muted/30 transition-colors gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20 shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground tracking-tight">
                        {job.type === 'bulk' ? 'Bulk Validation' : 'Single Validation'}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-muted">{(job.total_emails || 0).toLocaleString()} emails</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {getStatusBadge(job.status)}
                    {job.progress_percentage !== undefined && job.status === 'processing' && (
                      <div className="w-24">
                        <Progress value={job.progress_percentage} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="p-6 bg-muted/30 rounded-full mb-4 ring-1 ring-border/50">
                <Mail className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-foreground">No validations yet</p>
              <p className="text-sm mt-1">Run your first email verification to see results here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
