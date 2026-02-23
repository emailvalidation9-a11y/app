import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, Zap, Shield, BarChart3, ArrowRight, Check, Globe, Server, Terminal, Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: CheckCircle,
    title: 'Syntax Validation',
    description: 'Verify email format compliance with standard RFC guidelines.',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    icon: Globe,
    title: 'Domain Verification',
    description: 'Check MX records and domain existence instantly.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Server,
    title: 'SMTP Check',
    description: 'Verify if the mailbox actually exists without sending an email.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    icon: Shield,
    title: 'Spam Trap Detection',
    description: 'Identify known spam traps to protect your sender reputation.',
    color: 'text-red-500',
    bg: 'bg-red-500/10'
  },
  {
    icon: Zap,
    title: 'Disposable Email Filter',
    description: 'Detect and block temporary, throwaway email addresses.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  },
  {
    icon: BarChart3,
    title: 'Quality Scoring',
    description: 'Get a 0-100 deliverability score for every email address.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10'
  },
];

const stats = [
  { value: '99%', label: 'Accuracy', icon: Shield },
  { value: '50ms', label: 'Fast Response', icon: Zap },
  { value: '1M+', label: 'Emails Verified', icon: Server },
  { value: '24/7', label: 'Uptime', icon: Globe },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full mb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
              <Zap className="h-3.5 w-3.5 mr-2 inline-block" /> Fast and Reliable
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight text-foreground drop-shadow-sm">
              Email Verification <br className="hidden md:block" />
              <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Verify email addresses in real-time. Reduce bounce rates, block fake accounts, and protect your sender reputation quickly and easily.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" className="gap-2 h-14 px-8 text-base font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold bg-card/30 backdrop-blur-md border border-border/50 hover:bg-muted/50">
                  <Terminal className="h-4 w-4 mr-2" /> View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-card/10 backdrop-blur-lg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/40">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-6 w-6 text-primary/60" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-foreground drop-shadow-sm tracking-tighter">{stat.value}</div>
                <div className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge variant="outline" className="mb-4 bg-muted text-muted-foreground border-border/50">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Everything You Need To Validate Emails</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We check multiple data points to ensure that the emails you collect are real, deliverable, and safe to send to.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-card/40 backdrop-blur-sm border-border/40 hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 ring-1 ring-inset ring-white/10 shadow-inner group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security/Trust Section */}
      <section className="py-24 bg-card/30 border-y border-border/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1">
                <Lock className="h-3.5 w-3.5 mr-2 inline-block" /> Safe & Secure
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Your Data Is Private By Default</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We don't store your email lists. Your data is encrypted during processing and immediately deleted afterward to ensure complete privacy.
              </p>
              <ul className="space-y-4">
                {[
                  'No email data retention',
                  'Encrypted processing',
                  'GDPR & CCPA Compliant',
                  'Secure API endpoints'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium text-foreground">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl opacity-50 rounded-full"></div>
              <div className="bg-[#0d1117] border border-border/40 rounded-2xl p-6 relative shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-xs font-mono text-muted-foreground">Example API Request</span>
                </div>
                <div className="font-mono text-sm space-y-2 text-[#e6edf3]">
                  <div><span className="text-purple-400">POST</span> /api/validate/single</div>
                  <div className="opacity-70">{"{"}</div>
                  <div className="pl-4">"email": <span className="text-green-400">"hello@example.com"</span></div>
                  <div className="opacity-70">{"}"}</div>
                  <br />
                  <div className="text-blue-400">Response:</div>
                  <div className="opacity-70">{"{"}</div>
                  <div className="pl-4">"valid": <span className="text-yellow-400">true</span>,</div>
                  <div className="pl-4">"score": <span className="text-yellow-400">95</span>,</div>
                  <div className="pl-4">"smtp_check": <span className="text-yellow-400">true</span></div>
                  <div className="opacity-70">{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden mt-20">
        <div className="absolute inset-0 bg-primary/5"><div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join other companies using our tool to keep their email lists clean and deliverable.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/register"}>
            <Button size="lg" className="h-16 px-10 text-lg font-bold shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all gap-3 border border-primary/50">
              {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
