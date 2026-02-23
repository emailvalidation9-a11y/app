import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Shield, Zap, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export default function Setup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [setupRequired, setSetupRequired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkSetupStatus();
    }, []);

    const checkSetupStatus = async () => {
        try {
            const response = await api.get('/auth/setup/status');
            const { setupRequired: required } = response.data.data;
            setSetupRequired(required);
            if (!required) {
                toast.info('System is already configured. Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            toast.error('Failed to check setup status');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/setup', { name, email, password });
            const { token } = response.data.data;

            localStorage.setItem('token', token);
            toast.success('Admin account created successfully! Redirecting...');

            setTimeout(() => {
                window.location.href = '/admin';
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Setup failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isCheckingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-primary/15 rounded-full blur-[180px] opacity-60" />
                    <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-violet-500/15 rounded-full blur-[180px] opacity-40" />
                </div>
                <div className="flex flex-col items-center gap-4 z-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm font-medium tracking-wide">Checking system status...</p>
                </div>
            </div>
        );
    }

    // Already configured
    if (!setupRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-primary/15 rounded-full blur-[180px] opacity-60" />
                    <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-violet-500/15 rounded-full blur-[180px] opacity-40" />
                </div>
                <Card className="w-full max-w-md mx-4 border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl z-10">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="h-16 w-16 mx-auto rounded-2xl bg-green-500/15 flex items-center justify-center ring-1 ring-green-500/30 mb-5">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">System Already Configured</h2>
                        <p className="text-sm text-muted-foreground mb-6">An admin account already exists. Redirecting to login...</p>
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
    const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
    const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-primary/15 rounded-full blur-[180px] opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-violet-500/15 rounded-full blur-[180px] opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="w-full max-w-lg z-10">
                {/* Top Badge */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Initial Setup Required</span>
                    </div>
                </div>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.15)] mb-5">
                        <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Spam<span className="text-primary">Guard</span>
                    </h1>
                    <p className="text-xs text-primary/80 font-mono font-bold uppercase tracking-[0.2em] mt-1">System Configuration</p>
                </div>

                {/* Main Card */}
                <Card className="border-border/40 bg-card/70 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                    <CardHeader className="pb-4 pt-7 px-7">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Create Admin Account</CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Set up the system administrator to access the admin panel
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5 px-7">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="setup-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input
                                    id="setup-name"
                                    type="text"
                                    placeholder="System Administrator"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="setup-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                <Input
                                    id="setup-email"
                                    type="email"
                                    placeholder="admin@yourcompany.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="setup-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="setup-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all pr-11"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {/* Password Strength Indicator */}
                                {password.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 flex gap-1">
                                            {[1, 2, 3].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-muted/40'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-yellow-500' : 'text-green-500'
                                            }`}>
                                            {strengthLabels[passwordStrength]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="setup-confirm-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="setup-confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className={`h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all ${confirmPassword && password !== confirmPassword ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''
                                            }`}
                                    />
                                    {confirmPassword && password === confirmPassword && (
                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                    )}
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-[11px] text-red-500 font-medium mt-1">Passwords do not match</p>
                                )}
                            </div>

                            {/* Security Notice */}
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex gap-3">
                                <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">Secure Setup</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        This admin account will have full system access including user management, billing controls, and system configuration. This setup can only be performed once.
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 px-7 pb-7 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(var(--primary),0.15)] hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all relative overflow-hidden group"
                                disabled={isLoading || !name || !email || !password || !confirmPassword || password !== confirmPassword}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Admin Account...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Initialize System
                                    </>
                                )}
                            </Button>

                            <p className="text-[11px] text-muted-foreground text-center">
                                By proceeding, you acknowledge that you are the authorized system administrator.
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer */}
                <p className="text-center text-[11px] text-muted-foreground/60 mt-6 font-medium">
                    SpamGuard Enterprise System &bull; v1.0.0
                </p>
            </div>
        </div>
    );
}
