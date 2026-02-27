import { useEffect, useState } from 'react';
import { billingApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Loader2,
  Zap,
  Check,
  CreditCard,
  Calendar,
  Package,
} from 'lucide-react';

interface Plan {
  name: string;
  credits: number;
  price: number;
  features: string[];
  interval: string;
}

interface CreditPackage {
  credits: number;
  price: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: { paid: number; currency: string };
  credits: { added: number; deducted: number; before: number; after: number };
  description: string;
  status: string;
  created_at: string;
}

export default function Billing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [creditPackages, setCreditPackages] = useState<Record<string, CreditPackage>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isIndia = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
  const currencySymbol = isIndia ? '₹' : '$';
  const priceMultiplier = isIndia ? 83 : 1;

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [plansRes, transactionsRes] = await Promise.all([
        billingApi.getPlans(),
        billingApi.getTransactions(1, 5),
      ]);
      setPlans(plansRes.data.data.plans);
      setCreditPackages(plansRes.data.data.credit_packages);
      setTransactions(transactionsRes.data.data.transactions);
    } catch (error) {
      toast.error('Failed to fetch billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: string) => {
    setIsProcessing(plan);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load payment gateway. Please verify your connection.');
        setIsProcessing(null);
        return;
      }

      const isIndia = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
      const userCurrency = isIndia ? 'INR' : 'USD';

      const response = await billingApi.createCheckout({ plan, currency: userCurrency });
      const { data } = response.data;

      if (data.isFree) {
        toast.success(data.message);
        fetchBillingData();
        // Since we bypassed authContext update here, reload window.
        window.location.reload();
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'TrueValidator',
        description: `Subscription: ${plan}`,
        order_id: data.orderId,
        handler: async function (res: any) {
          try {
            await billingApi.verifyPayment({
              ...res,
              type: 'subscription',
              slug: plan,
              currency: userCurrency
            });
            toast.success('Subscription activated successfully!');
            fetchBillingData();
            window.location.reload();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(null);
          }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function () {
        toast.error('Payment failed');
        setIsProcessing(null);
      });
      rzp1.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
      setIsProcessing(null);
    }
  };

  const handleBuyCredits = async (packageName: string) => {
    setIsProcessing(packageName);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load payment gateway');
        setIsProcessing(null);
        return;
      }

      const isIndia = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
      const userCurrency = isIndia ? 'INR' : 'USD';

      const response = await billingApi.purchaseCredits({ package: packageName, currency: userCurrency });
      const { data } = response.data;

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'TrueValidator',
        description: `Credit Package: ${packageName}`,
        order_id: data.orderId,
        handler: async function (res: any) {
          try {
            await billingApi.verifyPayment({
              ...res,
              type: 'credit_package',
              slug: packageName,
              currency: userCurrency
            });
            toast.success('Credits added successfully!');
            fetchBillingData();
            window.location.reload();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(null);
          }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function () {
        toast.error('Payment failed');
        setIsProcessing(null);
      });
      rzp1.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
      setIsProcessing(null);
    }
  };

  const creditUsagePercentage = user?.plan?.credits_limit
    ? Math.round(((user.plan.credits_limit - (user.credits || 0)) / user.plan.credits_limit) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
            Plans & Billing
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and purchase additional credits
          </p>
        </div>
      </div>

      {/* Current Plan Card */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="border-b border-border/40 pb-5 relative z-10">
          <CardTitle className="text-xl">Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1 mt-1">Tier</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black capitalize tracking-tight">{user?.plan?.name}</p>
                  <Badge variant={user?.plan?.name === 'free' ? 'secondary' : 'default'} className={user?.plan?.name !== 'free' ? 'bg-primary/20 text-primary hover:bg-primary/30 shadow-inner' : 'opacity-70'}>
                    {user?.plan?.name === 'free' ? 'Free' : 'Pro'}
                  </Badge>
                </div>
              </div>
            </div>
            {user?.razorpay?.subscriptionId && (
              <div className="flex flex-col items-end gap-2 bg-background/50 p-3 rounded-xl border border-border/50 shadow-inner">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    Cycle resets on <span className="text-primary font-mono">{user?.plan?.renewal_date ? new Date(user.plan.renewal_date).toLocaleDateString() : 'N/A'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  <CreditCard className="h-3 w-3" />
                  <span className="capitalize">{user?.razorpay?.status || 'active'} state</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-background/40 p-5 rounded-xl border border-border/50">
            <div className="flex items-center justify-between mb-3 text-sm">
              <p className="font-semibold uppercase tracking-widest text-muted-foreground text-xs">Quota Exhaustion ({creditUsagePercentage}%)</p>
              <p className="font-mono font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded shadow-inner">
                {user?.credits?.toLocaleString()} <span className="text-muted-foreground font-normal">/ {user?.plan?.credits_limit?.toLocaleString()} NODES</span>
              </p>
            </div>
            <Progress value={creditUsagePercentage} className="h-3 bg-muted shadow-inner" />
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-black tracking-tight mb-5 flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" /> Auto-Renewing Infrastructure
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(plans)
            .filter(([key]) => key !== 'free')
            .map(([key, plan]) => (
              <Card
                key={key}
                className={`relative overflow-hidden transition-all duration-300 ${user?.plan?.name === key ? 'border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(var(--primary),0.15)] scale-[1.02]' : 'border-border/40 bg-card/60 backdrop-blur-xl hover:shadow-xl hover:border-primary/30 group'}`}
              >
                {user?.plan?.name === key && (
                  <div className="absolute top-0 right-0">
                    <div className="absolute top-4 right-[-40px] rotate-45 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 w-40 text-center shadow-lg">Active System</div>
                  </div>
                )}
                <div className={`absolute inset-x-0 top-0 h-1 ${user?.plan?.name === key ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30 transition-colors'}`} />
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl mb-1 capitalize tracking-tight">{plan.name}</CardTitle>
                  <CardDescription className="flex items-end gap-1">
                    <span className="text-4xl font-black text-foreground">{currencySymbol}{Math.round(plan.price * priceMultiplier)}</span>
                    <span className="text-muted-foreground font-medium mb-1">/{plan.interval === 'year' ? 'yr' : 'mo'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="p-3 rounded-lg bg-background/60 border border-border/50 text-center shadow-inner">
                    <p className="text-lg font-bold text-primary">
                      {plan.credits.toLocaleString()} <span className="text-xs uppercase tracking-widest text-muted-foreground ml-1">credits/{plan.interval === 'year' ? 'yr' : 'mo'}</span>
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        <Check className="h-5 w-5 text-primary shrink-0 drop-shadow-sm mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 text-base ${user?.plan?.name === key ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground' : 'shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]'}`}
                    variant={user?.plan?.name === key ? 'outline' : 'default'}
                    disabled={isProcessing === key || user?.plan?.name === key}
                    onClick={() => handleSubscribe(key)}
                  >
                    {isProcessing === key ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Allocating...
                      </>
                    ) : user?.plan?.name === key ? (
                      'Current Plan'
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Credit Packages */}
      <div className="mt-12">
        <h2 className="text-2xl font-black tracking-tight mb-5 flex items-center gap-3">
          <Package className="h-6 w-6 text-indigo-400" /> Credit Packs
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(creditPackages).map(([key, pkg]) => (
            <Card key={key} className="border-border/40 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
                    <Package className="h-5 w-5 text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg capitalize tracking-tight">{key} Batch</CardTitle>
                </div>
                <CardDescription className="flex items-end gap-1 mt-2">
                  <span className="text-3xl font-black text-foreground">{currencySymbol}{Math.round(pkg.price * priceMultiplier)}</span>
                  <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1.5 ml-1">One-Time</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 relative z-10">
                <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-center shadow-inner group-hover:border-indigo-500/30 transition-colors">
                  <p className="text-2xl font-bold font-mono text-indigo-400">
                    +{pkg.credits.toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                    Verification Credits
                  </p>
                </div>
                <div className="flex items-start gap-3 text-xs font-semibold text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">Credits never expire. Use them anytime for email validations.</p>
                </div>
                <Button
                  className="w-full h-12 text-base shadow-sm border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-400"
                  variant="outline"
                  disabled={isProcessing === key}
                  onClick={() => handleBuyCredits(key)}
                >
                  {isProcessing === key ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Buy Credits'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card className="mt-12 border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-background/20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Transaction History</CardTitle>
              <CardDescription>Record of payments and credit purchases</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors" asChild>
              <a href="/billing/transactions">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          {transactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="h-16 w-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center ring-1 ring-border/50">
                <CreditCard className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-lg font-medium">No Transactions</p>
              <p className="text-sm mt-1">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 hover:bg-muted/10 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                      {transaction.type === 'subscription' ? (
                        <Calendar className="h-5 w-5 text-primary drop-shadow-sm" />
                      ) : (
                        <Zap className="h-5 w-5 text-primary drop-shadow-sm" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm tracking-tight">{transaction.description}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-border/50 sm:border-0 pt-4 sm:pt-0">
                    <p className={`font-black tracking-tight ${transaction.credits.added > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.credits.added > 0
                        ? `+${transaction.credits.added.toLocaleString()} NODES`
                        : `-${transaction.credits.deducted.toLocaleString()} NODES`}
                    </p>
                    {transaction.amount.paid > 0 && (
                      <p className="text-xs font-bold text-muted-foreground border border-border/50 bg-background/50 px-2 py-0.5 rounded uppercase tracking-widest mt-1.5 shadow-inner inline-block">
                        {transaction.amount.currency === 'INR' ? '₹' : '$'} {(transaction.amount.paid / 100).toFixed(2)} {transaction.amount.currency}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
