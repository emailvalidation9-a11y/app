import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validationApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Shield,
  Server,
  Globe,
  User,
  Zap,
} from 'lucide-react';

interface ValidationResult {
  email: string;
  status: string;
  score: number;
  checks: {
    syntax_valid: boolean;
    mx_found: boolean;
    smtp_valid: boolean;
    catch_all: boolean;
    disposable: boolean;
    role_based: boolean;
    free_provider: boolean;
  };
  response_time_ms: number;
}

export default function SingleValidation() {
  const [email, setEmail] = useState('');
  const [verifySMTP, setVerifySMTP] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { refreshUser } = useAuth();

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await validationApi.validateSingle(email, { verifySMTP });
      setResult(response.data.data);
      toast.success('Email validated successfully!');
      // Refresh user to sync credits
      await refreshUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'invalid':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'catch_all':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'disposable':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'role_based':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5" />;
      case 'invalid':
        return <XCircle className="h-5 w-5" />;
      case 'catch_all':
      case 'disposable':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="relative z-10 text-center md:text-left mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          Verify Email
        </h1>
        <p className="text-muted-foreground text-lg">
          Check any email address for deliverability in real-time
        </p>
      </div>

      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-1/4 p-32 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <CardHeader className="border-b border-border/40 pb-6 relative z-10">
          <CardTitle>Enter Email Address</CardTitle>
          <CardDescription>
            Type or paste the email address you want to validate
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <form onSubmit={handleValidate} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-14 text-lg bg-background/60 shadow-inner focus:bg-background transition-colors"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="h-14 px-8 text-base shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Zap className="mr-3 h-5 w-5" />
                    Verify Email
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/40">
              <div className="flex items-center space-x-3">
                <Switch
                  id="smtp"
                  checked={verifySMTP}
                  onCheckedChange={setVerifySMTP}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-primary"
                />
                <div>
                  <Label htmlFor="smtp" className="text-sm font-semibold cursor-pointer">
                    SMTP Verification
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Verify mailbox exists via SMTP connection</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                1 Credit
              </Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.1)] bg-card/60 backdrop-blur-xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-1/2 left-0 p-40 bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
          <CardHeader className="border-b border-border/40 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Verification Result</CardTitle>
                <CardDescription>
                  Completed in <span className="text-primary font-mono">{result.response_time_ms}ms</span>
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={`text-lg px-5 py-2.5 shadow-sm border-2 ${getStatusColor(result.status)}`}
              >
                {getStatusIcon(result.status)}
                <span className="ml-2 capitalize tracking-wide font-bold">{result.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-8 relative z-10">
            {/* Score */}
            <div className="flex items-center justify-center p-8 bg-background/50 rounded-2xl border border-border/50 shadow-inner">
              <div className="text-center">
                <p className="text-sm uppercase tracking-widest font-semibold text-muted-foreground mb-3">Deliverability Score</p>
                <div className="relative inline-block">
                  {/* Glowing text effect */}
                  <div className={`absolute -inset-2 blur-xl opacity-30 ${getScoreColor(result.score)}`}></div>
                  <p className={`relative text-7xl font-black ${getScoreColor(result.score)} tracking-tighter`}>
                    {result.score}
                  </p>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-3">/ 100</p>
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Checks */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${result.checks.syntax_valid ? 'bg-green-500/10 ring-green-500/30' : 'bg-red-500/10 ring-red-500/30'
                  }`}>
                  <Mail className={`h-6 w-6 ${result.checks.syntax_valid ? 'text-green-500' : 'text-red-500'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Syntax Valid</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.checks.syntax_valid ? 'Email format is valid' : 'Invalid email format'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${result.checks.mx_found ? 'bg-green-500/10 ring-green-500/30' : 'bg-red-500/10 ring-red-500/30'
                  }`}>
                  <Server className={`h-6 w-6 ${result.checks.mx_found ? 'text-green-500' : 'text-red-500'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">MX Record</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.checks.mx_found ? 'Mail server found' : 'No mail server found'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${result.checks.smtp_valid ? 'bg-green-500/10 ring-green-500/30' : 'bg-red-500/10 ring-red-500/30'
                  }`}>
                  <Shield className={`h-6 w-6 ${result.checks.smtp_valid ? 'text-green-500' : 'text-red-500'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">SMTP Check</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.checks.smtp_valid ? 'Mailbox exists' : 'Mailbox not found'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${!result.checks.catch_all ? 'bg-green-500/10 ring-green-500/30' : 'bg-yellow-500/10 ring-yellow-500/30'
                  }`}>
                  <Globe className={`h-6 w-6 ${!result.checks.catch_all ? 'text-green-500' : 'text-yellow-500'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Catch-All</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.checks.catch_all ? 'Accepts all addresses' : 'Individual mailboxes'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${!result.checks.disposable ? 'bg-green-500/10 ring-green-500/30' : 'bg-red-500/10 ring-red-500/30'
                  }`}>
                  <AlertTriangle className={`h-6 w-6 ${!result.checks.disposable ? 'text-green-500' : 'text-red-500'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Disposable Check</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.checks.disposable ? 'Temporary/disposable email' : 'Permanent email provider'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${!result.checks.role_based ? 'bg-green-500/10 ring-green-500/30' : 'bg-blue-500/10 ring-blue-500/30'
                  }`}>
                  <User className={`h-6 w-6 ${!result.checks.role_based ? 'text-green-500' : 'text-blue-500'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Role-Based</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.checks.role_based ? 'Generic address (info@, support@)' : 'Personal email address'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20 backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-primary/10">
          <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <Shield className="h-4 w-4" /> Status Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3 pt-4 font-medium text-foreground/80">
          <p className="flex items-start gap-2"><strong className="text-green-500 w-24 shrink-0">Valid:</strong> <span>Email exists and is safe to send to.</span></p>
          <p className="flex items-start gap-2"><strong className="text-red-500 w-24 shrink-0">Invalid:</strong> <span>Email will bounce. Do not send.</span></p>
          <p className="flex items-start gap-2"><strong className="text-yellow-500 w-24 shrink-0">Catch-All:</strong> <span>Domain accepts all addresses. Delivery uncertain.</span></p>
          <p className="flex items-start gap-2"><strong className="text-red-400 w-24 shrink-0">Disposable:</strong> <span>Temporary email. Not a real user.</span></p>
          <p className="flex items-start gap-2"><strong className="text-blue-500 w-24 shrink-0">Role-Based:</strong> <span>Group address (info@, support@). Low engagement.</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
