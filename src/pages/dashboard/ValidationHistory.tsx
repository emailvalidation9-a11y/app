import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { validationApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';

interface Job {
  id: string;
  type: string;
  status: string;
  total_emails: number;
  processed_emails: number;
  progress_percentage: number;
  valid_count: number;
  invalid_count: number;
  catch_all_count: number;
  disposable_count: number;
  role_based_count: number;
  unknown_count: number;
  created_at: string;
  completed_at: string;
  result_file: {
    download_url: string;
  } | null;
}

export default function ValidationHistory() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await validationApi.getJobs(pageNum, 10);
      setJobs(response.data.data.jobs);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch validation history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  // Auto-refresh active jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some((job) =>
      ['queued', 'processing', 'credits_reserved'].includes(job.status)
    );

    if (hasActiveJobs) {
      const interval = setInterval(() => {
        fetchJobs(page);
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [jobs, page]);

  const handleCancelJob = async (jobId: string) => {
    try {
      await validationApi.cancelJob(jobId);
      toast.success('Job cancelled successfully');
      fetchJobs(page);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel job');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      queued: 'secondary',
      processing: 'default',
      completed: 'outline',
      failed: 'destructive',
      cancelled: 'secondary',
      credits_reserved: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Mail className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
            Validation Logs
          </h1>
          <p className="text-muted-foreground text-lg">
            View and manage your email verification history
          </p>
        </div>
        <Button
          variant="outline"
          className="border-primary/20 hover:bg-primary/10 hover:text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-all duration-300"
          onClick={() => fetchJobs(page)}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-32 bg-primary/5 blur-[120px] rounded-full pointer-events-none w-full h-full" />
          <CardContent className="flex flex-col items-center justify-center py-24 relative z-10">
            <div className="p-6 bg-muted/30 rounded-full mb-6 ring-1 ring-border/50">
              <Mail className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">No Validations Yet</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-sm">
              You haven't run any email validations. Start by verifying a single email or uploading a list.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                <Link to="/validate/single">Verify Email</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-dashed border-2 hover:border-primary/50">
                <Link to="/validate/bulk">Bulk Verify</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all duration-300 relative group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                        {getStatusIcon(job.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-lg font-bold tracking-tight text-foreground">
                            {job.type === 'bulk' ? 'Bulk Validation' : 'Single Validation'}
                          </h3>
                          <div className="scale-90 origin-left">{getStatusBadge(job.status)}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-muted/50 text-foreground font-mono text-xs shadow-inner">{(job.total_emails || 0).toLocaleString()} emails</span>
                          </span>
                          <span className="opacity-50">•</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{new Date(job.created_at).toLocaleString()}</span>
                          {job.completed_at && (
                            <>
                              <span className="opacity-50">•</span>
                              <span className="flex items-center gap-1.5 text-primary/80">
                                Completed in{' '}
                                {Math.max(1, Math.round(
                                  (new Date(job.completed_at).getTime() -
                                    new Date(job.created_at).getTime()) /
                                  1000 /
                                  60
                                ))}{' '}
                                min
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 lg:shrink-0 mt-2 lg:mt-0 lg:ml-auto">
                      {job.status === 'completed' && job.result_file?.download_url && (
                        <Button variant="outline" size="default" className="border-primary/30 text-primary hover:bg-primary/10 shadow-sm transition-colors" asChild>
                          <a href={job.result_file.download_url} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                      {['queued', 'processing', 'credits_reserved'].includes(job.status) && (
                        <Button
                          variant="destructive"
                          size="default"
                          className="shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          onClick={() => handleCancelJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel Job
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {['queued', 'processing', 'credits_reserved'].includes(job.status) && (
                    <div className="mt-8 p-5 rounded-xl border border-border/50 bg-background/40">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">Progress</span>
                        <span className="font-bold text-primary">{job.progress_percentage}%</span>
                      </div>
                      <Progress value={job.progress_percentage} className="h-2.5 bg-muted shadow-inner" />
                      <p className="text-xs font-mono text-muted-foreground mt-3 flex items-center justify-between">
                        <span>{(job.processed_emails || 0).toLocaleString()} of {(job.total_emails || 0).toLocaleString()} verified</span>
                      </p>
                    </div>
                  )}

                  {/* Results Summary */}
                  {job.status === 'completed' && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center transition-colors hover:bg-green-500/10">
                        <p className="text-3xl font-black text-green-500 drop-shadow-sm">
                          {(job.valid_count || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-500/80 mt-1">Valid</p>
                      </div>
                      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center transition-colors hover:bg-red-500/10">
                        <p className="text-3xl font-black text-red-500 drop-shadow-sm">
                          {(job.invalid_count || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/80 mt-1">Bounced</p>
                      </div>
                      <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-center transition-colors hover:bg-yellow-500/10">
                        <p className="text-3xl font-black text-yellow-500 drop-shadow-sm">
                          {(job.catch_all_count || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80 mt-1">Catch-All</p>
                      </div>
                      <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 text-center transition-colors hover:bg-orange-500/10">
                        <p className="text-3xl font-black text-orange-500 drop-shadow-sm">
                          {(job.disposable_count || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500/80 mt-1">Disposables</p>
                      </div>
                      <div className="p-4 rounded-xl border border-muted bg-muted/30 text-center transition-colors hover:bg-muted/50 col-span-2 md:col-span-1">
                        <p className="text-3xl font-black text-muted-foreground drop-shadow-sm">
                          {(job.unknown_count || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mt-1">Unknown</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
