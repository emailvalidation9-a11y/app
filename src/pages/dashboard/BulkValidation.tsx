import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { validationApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface UploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
}

interface JobResult {
  job_id: string;
  total_emails: number;
  status: string;
  estimated_time_seconds: number;
}

export default function BulkValidation() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isUploading: false,
    progress: 0,
  });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [jobResult, setJobResult] = useState<JobResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 50MB.');
        return;
      }
      setUploadState((prev) => ({ ...prev, file }));
      setJobResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!uploadState.file) {
      toast.error('Please select a file first');
      return;
    }

    setUploadState((prev) => ({ ...prev, isUploading: true }));

    try {
      const response = await validationApi.validateBulk(
        uploadState.file,
        webhookUrl || undefined
      );

      setJobResult(response.data.data);
      toast.success('Bulk validation job started!');

      // Reset file after successful upload
      setUploadState({
        file: null,
        isUploading: false,
        progress: 100,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
      setUploadState((prev) => ({ ...prev, isUploading: false, progress: 0 }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="relative z-10 text-center md:text-left mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          Bulk Verify
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload a CSV or spreadsheet to validate thousands of emails at once
        </p>
      </div>

      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="border-b border-border/40 pb-6 relative z-10">
          <CardTitle>Upload Email List</CardTitle>
          <CardDescription>
            Supports CSV, Excel, and text files up to 50MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6 relative z-10">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 mt-2 text-center cursor-pointer transition-all duration-300 ${isDragActive
              ? 'border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(var(--primary),0.2)]'
              : 'border-muted border-primary/20 bg-background/50 hover:border-primary/50 hover:bg-background/80'
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner ring-1 ring-primary/20 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {isDragActive ? 'Drop file here' : 'Drag & Drop your file'}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  or click to browse
                </p>
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 font-semibold">
                CSV • XLSX • XLS • TXT (Max 50MB)
              </p>
            </div>
          </div>

          {/* File Rejection Errors */}
          {fileRejections.length > 0 && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Invalid file</p>
              </div>
              <p className="text-sm text-red-500/80 mt-1">
                Please upload a valid CSV, XLSX, XLS, or TXT file.
              </p>
            </div>
          )}

          {/* Selected File */}
          {uploadState.file && (
            <div className="p-4 rounded-xl border border-primary/20 bg-background/60 shadow-inner flex items-center justify-between animate-fade-in group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{uploadState.file.name}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {formatFileSize(uploadState.file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setUploadState({ file: null, isUploading: false, progress: 0 })}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Webhook URL (Optional) */}
          <div className="space-y-3 p-5 rounded-xl border border-border/50 bg-background/30">
            <Label htmlFor="webhook" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Webhook URL <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted">Optional</span>
            </Label>
            <Input
              id="webhook"
              type="url"
              placeholder="https://your-app.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="h-12 bg-background/50 focus:bg-background transition-colors font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground pt-1">
              We'll send a POST request to this URL when validation completes.
            </p>
          </div>

          <div className="pt-2">
            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!uploadState.file || uploadState.isUploading}
              className="w-full h-14 text-lg shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)]"
              size="lg"
            >
              {uploadState.isUploading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-3 h-6 w-6" />
                  Start Validation
                </>
              )}
            </Button>

            {/* Upload Progress */}
            {uploadState.isUploading && (
              <div className="space-y-3 mt-6 p-4 rounded-xl bg-muted/30">
                <Progress value={uploadState.progress} className="h-2" />
                <div className="flex justify-between items-center text-xs font-mono text-muted-foreground font-semibold">
                  <span>UPLOADING</span>
                  <span>{uploadState.progress}%</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Result */}
      {jobResult && (
        <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-md shadow-[0_0_40px_rgba(34,197,94,0.1)] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
          <CardHeader className="relative z-10 border-b border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center ring-1 ring-green-500/30">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-500">Job Created</CardTitle>
                <CardDescription className="text-base text-green-500/70">
                  Your validation job has been queued for processing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-green-500/20 bg-background/50 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Queue ID</p>
                <p className="font-mono text-sm tracking-tighter truncate text-green-400">{jobResult.job_id}</p>
              </div>
              <div className="p-4 rounded-xl border border-green-500/20 bg-background/50 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Emails Found</p>
                <p className="text-2xl font-black text-foreground">{(jobResult.total_emails || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-muted/50 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Time</p>
                  <p className="font-semibold text-lg">
                    T-{Math.ceil(jobResult.estimated_time_seconds / 60)}m 00s
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-500 shadow-sm">
                <a href="/history">
                  View Progress
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20 backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm uppercase tracking-widest text-primary">File Format Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-foreground/80 space-y-3 pt-4 font-medium">
          <p className="flex items-center gap-3"><span className="p-1 rounded bg-muted/50 text-xs font-black min-w-8 text-center text-muted-foreground">CSV</span> <span>One email per row, or a column named "email"</span></p>
          <p className="flex items-center gap-3"><span className="p-1 rounded bg-muted/50 text-xs font-black min-w-8 text-center text-muted-foreground">XLS</span> <span>Emails should be in the first column (Column A)</span></p>
          <p className="flex items-center gap-3"><span className="p-1 rounded bg-muted/50 text-xs font-black min-w-8 text-center text-muted-foreground">TXT</span> <span>One email per line</span></p>
          <div className="mt-4 p-3 bg-background/50 border border-border/50 rounded-lg">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Parsing Example:</p>
            <code className="text-primary font-mono select-all">user@gmail.com, info@company.com, hello@startup.io</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
