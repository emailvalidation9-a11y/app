import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';

import { Loader2 } from 'lucide-react';
import { publicApi } from '@/services/api';
import { useEffect, useState } from 'react';

// Types for fetched plans
interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: string;
  description: string;
  credits: number;
  features: string[];
  cta_text: string;
  is_popular: boolean;
  type: string;
}

interface CreditPackage {
  id: string;
  name: string;
  slug: string;
  price: number;
  credits: number;
  per_credit_cost: number;
}
// Legacy fallbacks inside component if needed or just empty array

const faqs = [
  {
    question: 'What happens if I try to validate a bad email?',
    answer: 'Any email you validate—whether good or bad—counts as one validation credit. We only charge for the attempt to validate the email for you.',
  },
  {
    question: 'How fast is the API?',
    answer: 'Most single email checks take less than 100 milliseconds. Bulk uploads depend on the file size, but process quickly in the background.',
  },
  {
    question: 'Do my monthly credits roll over?',
    answer: 'Monthly subscription credits reset every month. However, purchased "Add-on" credits never expire and are used only after your monthly credits run out.',
  },
  {
    question: 'What happens when I run out of credits?',
    answer: 'You can no longer validate emails until you either purchase an add-on credit package or wait for your monthly cycle to renew.',
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await publicApi.getPublicPlans();
      setPlans(data.data.plans || []);
      setCreditPackages(data.data.creditPackages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full mb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Zap className="h-3.5 w-3.5 mr-2 inline-block" /> Simple Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-foreground drop-shadow-sm">
            Honest <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose a monthly plan or just buy credits as you need them. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative flex flex-col bg-card/40 backdrop-blur-md border border-border/40 hover:bg-card/60 transition-all duration-300 ${plan.is_popular ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(var(--primary),0.15)] md:-mt-8 md:mb-8 z-10' : ''}`}>
                {plan.is_popular && (
                  <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground uppercase tracking-widest text-[10px] font-bold px-3 py-1 shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8 flex-1 flex flex-col pt-10">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold tracking-tight mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground h-10">{plan.description}</p>
                  </div>
                  <div className="mb-8 pb-8 border-b border-border/40">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                      <span className="text-muted-foreground font-medium">/{plan.interval}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mt-2">
                      <Zap className="h-4 w-4" /> {plan.credits.toLocaleString()} credits/{plan.interval}
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature: string, fIndex: number) => (
                      <li key={fIndex} className="flex items-start gap-3 text-sm font-medium">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"} className="block mt-auto">
                    <Button variant={plan.is_popular ? 'default' : 'outline'} className={`w-full h-12 font-bold tracking-wide ${plan.is_popular ? 'shadow-[0_0_15px_rgba(var(--primary),0.3)]' : ''}`}>
                      {isAuthenticated ? 'Go to Dashboard' : plan.cta_text || 'Select Plan'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Packages */}
      <section className="py-24 bg-card/20 border-y border-border/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Add-On Credits</h2>
            <p className="text-muted-foreground">Buy extra credits when you need them. They never expire.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg, index) => (
              <Card key={index} className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/50 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black mb-2 tracking-tighter group-hover:text-primary transition-colors">{pkg.credits.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">Credits</div>
                  <div className="text-2xl font-bold mb-1">${pkg.price}</div>
                  <div className="text-xs text-muted-foreground mb-6 font-mono">${pkg.per_credit_cost || (pkg.price / pkg.credits).toFixed(5)} / validation</div>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                    <Button variant="outline" className="w-full font-bold">
                      {isAuthenticated ? 'Buy Now' : 'Create Account'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our billing.</p>
          </div>
          <Accordion type="single" collapsible className="w-full bg-card/30 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/40 px-6">
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary/5 border-t border-border/40 relative overflow-hidden mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Need higher volumes?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            If you need millions of validations per month, let's talk. We have a custom plan for you.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="default" className="h-14 px-8 font-bold gap-2">
              Contact Us <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
