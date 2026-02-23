import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset email';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="w-full">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <MailCheck className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                    <CardDescription>
                        We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <Link to="/login" className="w-full">
                        <Button variant="outline" className="w-full">
                            Back to login
                        </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground text-center">
                        Didn't receive the email?{' '}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="text-primary hover:underline"
                        >
                            Click to resend
                        </button>
                    </p>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
                <CardDescription>
                    Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading || !email}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </Button>
                    <Link
                        to="/login"
                        className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}
