import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
    Plus, Pencil, Trash2, Loader2, Zap, CreditCard, Tag, Sparkles,
    Package, Star, Ticket, Percent, DollarSign, Gift, Database
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface Plan {
    _id: string;
    name: string;
    slug: string;
    price: number;
    interval: string;
    credits: number;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    sort_order: number;
    type: 'subscription' | 'credit_package';
    per_credit_cost: number;
    description: string;
    cta_text: string;
}

interface Coupon {
    _id: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed' | 'credits';
    discount_value: number;
    max_discount: number | null;
    bonus_credits: number;
    applicable_plans: any[];
    min_purchase_amount: number;
    max_uses: number | null;
    max_uses_per_user: number;
    current_uses: number;
    starts_at: string;
    expires_at: string | null;
    is_active: boolean;
    createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminPricing() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('plans');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [plansRes, couponsRes] = await Promise.all([
                adminApi.getPricingPlans(),
                adminApi.getCoupons()
            ]);
            setPlans(plansRes.data.data.plans || []);
            setCoupons(couponsRes.data.data.coupons || []);
        } catch {
            toast.error('Failed to load pricing data');
        } finally {
            setLoading(false);
        }
    };

    const handleSeedPlans = async () => {
        try {
            await adminApi.seedPricingPlans();
            toast.success('Default plans seeded successfully');
            fetchAll();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to seed plans');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="border-border/40 bg-card/50">
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const subscriptionPlans = plans.filter(p => p.type === 'subscription');
    const creditPackages = plans.filter(p => p.type === 'credit_package');

    return (
        <div className="space-y-6 animate-fade-in">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-card/60 border border-border/40 p-1 backdrop-blur">
                        <TabsTrigger value="plans" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                            <CreditCard className="h-4 w-4" /> Plans & Packages
                        </TabsTrigger>
                        <TabsTrigger value="coupons" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                            <Ticket className="h-4 w-4" /> Coupons
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* ═══ PLANS TAB ═══ */}
                <TabsContent value="plans" className="space-y-8">
                    {/* Seed button when empty */}
                    {plans.length === 0 && (
                        <Card className="border-dashed border-2 border-border/60 bg-card/30">
                            <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
                                <Database className="h-12 w-12 text-muted-foreground/40" />
                                <h3 className="text-lg font-bold">No Plans Configured</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Get started by seeding the default pricing plans, or create custom ones.
                                </p>
                                <div className="flex gap-3 mt-2">
                                    <Button onClick={handleSeedPlans} className="gap-2">
                                        <Sparkles className="h-4 w-4" /> Seed Default Plans
                                    </Button>
                                    <PlanDialog onSave={fetchAll}>
                                        <Button variant="outline" className="gap-2">
                                            <Plus className="h-4 w-4" /> Create Custom
                                        </Button>
                                    </PlanDialog>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Subscription Plans */}
                    {subscriptionPlans.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                        <CreditCard className="h-4.5 w-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm">Subscription Plans</h2>
                                        <p className="text-xs text-muted-foreground">{subscriptionPlans.length} plan(s)</p>
                                    </div>
                                </div>
                                <PlanDialog onSave={fetchAll} defaultType="subscription">
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-3.5 w-3.5" /> Add Plan
                                    </Button>
                                </PlanDialog>
                            </div>
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {subscriptionPlans.map(plan => (
                                    <PlanCard key={plan._id} plan={plan} onRefresh={fetchAll} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Credit Packages */}
                    {creditPackages.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
                                        <Package className="h-4.5 w-4.5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm">Credit Packages</h2>
                                        <p className="text-xs text-muted-foreground">{creditPackages.length} package(s)</p>
                                    </div>
                                </div>
                                <PlanDialog onSave={fetchAll} defaultType="credit_package">
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Plus className="h-3.5 w-3.5" /> Add Package
                                    </Button>
                                </PlanDialog>
                            </div>
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {creditPackages.map(plan => (
                                    <PlanCard key={plan._id} plan={plan} onRefresh={fetchAll} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Show add buttons when plans exist but one type is missing */}
                    {plans.length > 0 && (subscriptionPlans.length === 0 || creditPackages.length === 0) && (
                        <PlanDialog onSave={fetchAll} defaultType={subscriptionPlans.length === 0 ? 'subscription' : 'credit_package'}>
                            <Button variant="outline" className="gap-2 w-full border-dashed">
                                <Plus className="h-4 w-4" /> Add {subscriptionPlans.length === 0 ? 'Subscription Plan' : 'Credit Package'}
                            </Button>
                        </PlanDialog>
                    )}
                </TabsContent>

                {/* ═══ COUPONS TAB ═══ */}
                <TabsContent value="coupons" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center ring-1 ring-green-500/20">
                                <Ticket className="h-4.5 w-4.5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm">Coupon Codes</h2>
                                <p className="text-xs text-muted-foreground">{coupons.length} coupon(s)</p>
                            </div>
                        </div>
                        <CouponDialog plans={plans} onSave={fetchAll}>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-3.5 w-3.5" /> Create Coupon
                            </Button>
                        </CouponDialog>
                    </div>

                    {coupons.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/60 bg-card/30">
                            <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
                                <Tag className="h-12 w-12 text-muted-foreground/40" />
                                <h3 className="text-lg font-bold">No Coupons Created</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Create discount coupons for your users. Supports percentage, fixed, and bonus credit discounts.
                                </p>
                                <CouponDialog plans={plans} onSave={fetchAll}>
                                    <Button className="gap-2 mt-2">
                                        <Plus className="h-4 w-4" /> Create First Coupon
                                    </Button>
                                </CouponDialog>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {coupons.map(coupon => (
                                <CouponCard key={coupon._id} coupon={coupon} plans={plans} onRefresh={fetchAll} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PLAN CARD
// ═══════════════════════════════════════════════════════════════
function PlanCard({ plan, onRefresh }: { plan: Plan; onRefresh: () => void }) {
    const handleDelete = async () => {
        try {
            await adminApi.deletePricingPlan(plan._id);
            toast.success(`Plan "${plan.name}" deleted`);
            onRefresh();
        } catch {
            toast.error('Failed to delete plan');
        }
    };

    const handleToggleActive = async () => {
        try {
            await adminApi.updatePricingPlan(plan._id, { is_active: !plan.is_active });
            toast.success(`Plan ${plan.is_active ? 'deactivated' : 'activated'}`);
            onRefresh();
        } catch {
            toast.error('Failed to update plan');
        }
    };

    return (
        <Card className={`border-border/40 bg-card/50 backdrop-blur relative group transition-all hover:border-border/60 ${!plan.is_active ? 'opacity-60' : ''}`}>
            {plan.is_popular && (
                <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] font-bold gap-1">
                        <Star className="h-3 w-3" /> Popular
                    </Badge>
                </div>
            )}
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-base">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.description || plan.slug}</p>
                    </div>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-black">${plan.price}</span>
                    {plan.type === 'subscription' && (
                        <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Zap className="h-3 w-3" /> {plan.credits.toLocaleString()} credits
                    </Badge>
                    {plan.type === 'credit_package' && plan.per_credit_cost > 0 && (
                        <Badge variant="outline" className="text-xs font-mono">
                            ${plan.per_credit_cost}/ea
                        </Badge>
                    )}
                </div>

                {plan.type === 'subscription' && plan.features.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1.5 mb-4">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                                {f}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 mr-auto">
                        <Switch
                            checked={plan.is_active}
                            onCheckedChange={handleToggleActive}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-[11px] text-muted-foreground">{plan.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <PlanDialog plan={plan} onSave={onRefresh}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                    </PlanDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{plan.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════
// PLAN DIALOG (Create / Edit)
// ═══════════════════════════════════════════════════════════════
function PlanDialog({ children, plan, onSave, defaultType }: {
    children: React.ReactNode;
    plan?: Plan;
    onSave: () => void;
    defaultType?: string;
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', price: 0, interval: 'month', credits: 0,
        features: '', is_popular: false, type: defaultType || 'subscription',
        description: '', cta_text: 'Get Started', sort_order: 0, per_credit_cost: 0
    });

    useEffect(() => {
        if (plan && open) {
            setForm({
                name: plan.name, price: plan.price, interval: plan.interval,
                credits: plan.credits, features: plan.features.join('\n'),
                is_popular: plan.is_popular, type: plan.type,
                description: plan.description, cta_text: plan.cta_text,
                sort_order: plan.sort_order, per_credit_cost: plan.per_credit_cost
            });
        } else if (!plan && open) {
            setForm({
                name: '', price: 0, interval: 'month', credits: 0,
                features: '', is_popular: false, type: defaultType || 'subscription',
                description: '', cta_text: 'Get Started', sort_order: 0, per_credit_cost: 0
            });
        }
    }, [plan, open, defaultType]);

    const handleSubmit = async () => {
        if (!form.name) { toast.error('Name is required'); return; }
        setSaving(true);
        try {
            const data = {
                ...form,
                features: form.type === 'subscription' ? form.features.split('\n').filter(f => f.trim()) : []
            };
            if (plan) {
                await adminApi.updatePricingPlan(plan._id, data);
                toast.success('Plan updated');
            } else {
                await adminApi.createPricingPlan(data);
                toast.success('Plan created');
            }
            setOpen(false);
            onSave();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{plan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
                    <DialogDescription>
                        {plan ? `Editing "${plan.name}"` : 'Fill in the details for the new plan'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Name</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Pro Plan" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Type</Label>
                            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="subscription">Subscription</SelectItem>
                                    <SelectItem value="credit_package">Credit Package</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Price ($)</Label>
                            <Input type="number" min={0} step={0.01} value={form.price}
                                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Credits</Label>
                            <Input type="number" min={0} value={form.credits}
                                onChange={e => setForm({ ...form, credits: parseInt(e.target.value) || 0 })} />
                        </div>
                        {form.type === 'subscription' ? (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Interval</Label>
                                <Select value={form.interval} onValueChange={v => setForm({ ...form, interval: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month">Monthly</SelectItem>
                                        <SelectItem value="year">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Per Credit ($)</Label>
                                <Input type="number" min={0} step={0.001} value={form.per_credit_cost}
                                    onChange={e => setForm({ ...form, per_credit_cost: parseFloat(e.target.value) || 0 })} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Description</Label>
                        <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Short description" />
                    </div>

                    {form.type === 'subscription' && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Features (one per line)</Label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={form.features}
                                onChange={e => setForm({ ...form, features: e.target.value })}
                                placeholder={"5,000 validations/month\nBulk list validation\nSMTP verification"}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">CTA Button Text</Label>
                            <Input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Sort Order</Label>
                            <Input type="number" min={0} value={form.sort_order}
                                onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>

                    {form.type === 'subscription' && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <Switch checked={form.is_popular} onCheckedChange={v => setForm({ ...form, is_popular: v })} />
                            <div>
                                <span className="text-sm font-semibold">Mark as Popular</span>
                                <p className="text-xs text-muted-foreground">Highlighted with a badge on the pricing page</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {plan ? 'Save Changes' : 'Create Plan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ═══════════════════════════════════════════════════════════════
// COUPON CARD
// ═══════════════════════════════════════════════════════════════
function CouponCard({ coupon, plans, onRefresh }: { coupon: Coupon; plans: Plan[]; onRefresh: () => void }) {
    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    const isMaxedOut = coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses;
    const isInvalid = !coupon.is_active || isExpired || isMaxedOut;

    const handleDelete = async () => {
        try {
            await adminApi.deleteCoupon(coupon._id);
            toast.success(`Coupon "${coupon.code}" deleted`);
            onRefresh();
        } catch {
            toast.error('Failed to delete coupon');
        }
    };

    const handleToggle = async () => {
        try {
            await adminApi.updateCoupon(coupon._id, { is_active: !coupon.is_active });
            toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'}`);
            onRefresh();
        } catch {
            toast.error('Failed to update coupon');
        }
    };

    const discountLabel = coupon.discount_type === 'percentage'
        ? `${coupon.discount_value}% off`
        : coupon.discount_type === 'fixed'
            ? `$${coupon.discount_value} off`
            : `${coupon.discount_value} bonus credits`;

    const DiscountIcon = coupon.discount_type === 'percentage' ? Percent
        : coupon.discount_type === 'fixed' ? DollarSign : Gift;

    return (
        <Card className={`border-border/40 bg-card/50 backdrop-blur transition-all ${isInvalid ? 'opacity-60' : ''}`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ring-1 ${coupon.discount_type === 'percentage' ? 'bg-green-500/10 ring-green-500/20' :
                            coupon.discount_type === 'fixed' ? 'bg-blue-500/10 ring-blue-500/20' :
                                'bg-purple-500/10 ring-purple-500/20'
                            }`}>
                            <DiscountIcon className={`h-5 w-5 ${coupon.discount_type === 'percentage' ? 'text-green-500' :
                                coupon.discount_type === 'fixed' ? 'text-blue-500' : 'text-purple-500'
                                }`} />
                        </div>
                        <div>
                            <code className="font-bold text-base tracking-wider">{coupon.code}</code>
                            <p className="text-xs text-muted-foreground mt-0.5">{coupon.description || discountLabel}</p>
                        </div>
                    </div>
                    <Badge variant={isInvalid ? 'destructive' : 'secondary'} className="text-[10px]">
                        {isExpired ? 'Expired' : isMaxedOut ? 'Max Used' : !coupon.is_active ? 'Inactive' : 'Active'}
                    </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs gap-1">
                        <DiscountIcon className="h-3 w-3" /> {discountLabel}
                    </Badge>
                    {coupon.max_discount && (
                        <Badge variant="outline" className="text-xs">Max: ${coupon.max_discount}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                        {coupon.current_uses}/{coupon.max_uses ?? '∞'} uses
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {coupon.max_uses_per_user}/user
                    </Badge>
                </div>

                {coupon.expires_at && (
                    <p className="text-[11px] text-muted-foreground mb-3">
                        Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                    </p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 mr-auto">
                        <Switch checked={coupon.is_active} onCheckedChange={handleToggle} className="data-[state=checked]:bg-green-500" />
                        <span className="text-[11px] text-muted-foreground">{coupon.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <CouponDialog coupon={coupon} plans={plans} onSave={onRefresh}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                    </CouponDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete coupon "{coupon.code}"?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════
// COUPON DIALOG (Create / Edit)
// ═══════════════════════════════════════════════════════════════
function CouponDialog({ children, coupon, plans: _plans, onSave }: {
    children: React.ReactNode;
    coupon?: Coupon;
    plans: Plan[];
    onSave: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        code: '', description: '', discount_type: 'percentage' as string,
        discount_value: 10, max_discount: '',
        bonus_credits: 0, min_purchase_amount: 0,
        max_uses: '', max_uses_per_user: 1,
        expires_at: '', is_active: true
    });

    useEffect(() => {
        if (coupon && open) {
            setForm({
                code: coupon.code, description: coupon.description,
                discount_type: coupon.discount_type, discount_value: coupon.discount_value,
                max_discount: coupon.max_discount?.toString() || '',
                bonus_credits: coupon.bonus_credits,
                min_purchase_amount: coupon.min_purchase_amount,
                max_uses: coupon.max_uses?.toString() || '',
                max_uses_per_user: coupon.max_uses_per_user,
                expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
                is_active: coupon.is_active
            });
        } else if (!coupon && open) {
            setForm({
                code: '', description: '', discount_type: 'percentage',
                discount_value: 10, max_discount: '',
                bonus_credits: 0, min_purchase_amount: 0,
                max_uses: '', max_uses_per_user: 1,
                expires_at: '', is_active: true
            });
        }
    }, [coupon, open]);

    const handleSubmit = async () => {
        if (!form.code && !coupon) { toast.error('Code is required'); return; }
        setSaving(true);
        try {
            const data: any = {
                ...form,
                max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
                max_uses: form.max_uses ? parseInt(form.max_uses) : null,
                expires_at: form.expires_at || null
            };
            if (coupon) {
                delete data.code;
                await adminApi.updateCoupon(coupon._id, data);
                toast.success('Coupon updated');
            } else {
                await adminApi.createCoupon(data);
                toast.success('Coupon created');
            }
            setOpen(false);
            onSave();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{coupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
                    <DialogDescription>
                        {coupon ? `Editing "${coupon.code}"` : 'Create a new discount coupon'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Coupon Code</Label>
                            <Input
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="SAVE20"
                                disabled={!!coupon}
                                className="font-mono uppercase"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Discount Type</Label>
                            <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage"><span className="flex items-center gap-2"><Percent className="h-3.5 w-3.5" /> Percentage</span></SelectItem>
                                    <SelectItem value="fixed"><span className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" /> Fixed Amount</span></SelectItem>
                                    <SelectItem value="credits"><span className="flex items-center gap-2"><Gift className="h-3.5 w-3.5" /> Bonus Credits</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                {form.discount_type === 'percentage' ? 'Discount %' : form.discount_type === 'fixed' ? 'Discount $' : 'Bonus Credits'}
                            </Label>
                            <Input type="number" min={0} value={form.discount_value}
                                onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} />
                        </div>
                        {form.discount_type === 'percentage' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Max Discount ($)</Label>
                                <Input type="number" min={0} placeholder="No limit" value={form.max_discount}
                                    onChange={e => setForm({ ...form, max_discount: e.target.value })} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Description</Label>
                        <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="20% off your first purchase" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Max Total Uses</Label>
                            <Input type="number" min={0} placeholder="Unlimited" value={form.max_uses}
                                onChange={e => setForm({ ...form, max_uses: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Per User</Label>
                            <Input type="number" min={1} value={form.max_uses_per_user}
                                onChange={e => setForm({ ...form, max_uses_per_user: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Min Purchase ($)</Label>
                            <Input type="number" min={0} value={form.min_purchase_amount}
                                onChange={e => setForm({ ...form, min_purchase_amount: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Expiry Date (optional)</Label>
                        <Input type="datetime-local" value={form.expires_at}
                            onChange={e => setForm({ ...form, expires_at: e.target.value })} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {coupon ? 'Save Changes' : 'Create Coupon'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
