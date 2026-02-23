import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';

export default function VerifyEmail() {
    const { user, logout } = useAuth();
    const [isResending, setIsResending] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await authApi.resendVerification();
            toast.success('Verification email sent! Check your inbox.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend email');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                            <MailCheck className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                    <CardDescription className="text-base">
                        We've sent a verification link to{' '}
                        <span className="font-medium text-foreground">{user?.email || 'your email'}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Click the link in the email to verify your account. If you don't see it, check your spam folder.
                    </p>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-xs text-muted-foreground">
                            📧 The email may take a few minutes to arrive. Make sure to check your <strong>spam/junk</strong> folder as well.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleResend}
                        disabled={isResending}
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Resend verification email'
                        )}
                    </Button>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Sign out & use a different account
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}
