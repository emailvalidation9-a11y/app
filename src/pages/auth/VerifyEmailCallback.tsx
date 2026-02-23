import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailCallback() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (token) {
            verifyToken(token);
        }
    }, [token]);

    const verifyToken = async (verificationToken: string) => {
        try {
            const response = await authApi.verifyEmail(verificationToken);
            const { token: authToken } = response.data.data;

            // Store the new token
            localStorage.setItem('token', authToken);

            // Refresh user data in context
            await refreshUser();

            setStatus('success');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2500);
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Invalid or expired verification link');
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Verifying your email...</CardTitle>
                        <CardDescription>Please wait while we verify your email address.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                        <CardDescription>
                            Your email has been successfully verified. Redirecting to your dashboard...
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pt-2">
                        <Link to="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
                    <CardDescription>{errorMessage}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                        The verification link may have expired or already been used.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-2">
                    <Link to="/login" className="w-full">
                        <Button variant="outline" className="w-full">
                            Back to Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
