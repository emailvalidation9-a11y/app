import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Terminal, Zap, BookOpen, Key, ListChecks, ShieldAlert, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const codeExamples = {
  curl: `curl -X POST \\
  https://api.truevalidator.dev/api/validate/single \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "options": {
      "verifySMTP": true
    }
  }'`,

  javascript: `const response = await fetch(
  'https://api.truevalidator.dev/api/validate/single',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      options: {
        verifySMTP: true
      }
    }),
  }
);

const result = await response.json();
console.log(result);`,

  python: `import requests

response = requests.post(
    'https://api.truevalidator.dev/api/validate/single',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'email': 'test@example.com',
        'options': {
            'verifySMTP': True
        }
    }
)

result = response.json()
print(result)`,

  php: `<?php
$ch = curl_init('https://api.truevalidator.dev/api/validate/single');

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'test@example.com',
    'options' => ['verifySMTP' => true]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`,
};

const responseExample = `{
  "success": true,
  "data": {
    "email": "test@example.com",
    "status": "valid",
    "score": 95,
    "checks": {
      "syntax_valid": true,
      "mx_found": true,
      "smtp_valid": true,
      "catch_all": false,
      "disposable": false,
      "role_based": false,
      "free_provider": false
    },
    "response_time_ms": 45
  }
}`;

const statusCodes = [
  { status: 'valid', description: 'Email is deliverable and safe to send', color: 'bg-green-500' },
  { status: 'invalid', description: 'Email is undeliverable - do not send', color: 'bg-red-500' },
  { status: 'catch_all', description: 'Domain accepts all emails - use with caution', color: 'bg-yellow-500' },
  { status: 'disposable', description: 'Temporary email address - high risk', color: 'bg-orange-500' },
  { status: 'role_based', description: 'Generic address (admin@, info@) - lower engagement', color: 'bg-blue-500' },
  { status: 'unknown', description: 'Could not verify - temporary error', color: 'bg-gray-500' },
];

export default function Documentation() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  const [activeNav, setActiveNav] = useState('introduction');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['introduction', 'authentication', 'quickstart', 'validate-single', 'status-codes', 'rate-limits', 'error-handling'];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 150) {
          setActiveNav(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyRes = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRes(true);
    setTimeout(() => setCopiedRes(false), 2000);
  };

  const NavItem = ({ href, label, id }: { href: string; label: string; id: string }) => (
    <a
      href={href}
      className={`block px-3 py-2 rounded-md transition-all duration-200 text-sm ${activeNav === id
        ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
        }`}
    >
      {label}
    </a>
  );

  return (
    <div className="min-h-screen relative">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] opacity-30 mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[150px] opacity-30 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Hero Header */}
      <div className="relative border-b border-border/40 bg-card/30 backdrop-blur-md pt-24 pb-12 z-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mb-6 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              <BookOpen className="h-3.5 w-3.5 mr-2" /> Developer Engine
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-foreground drop-shadow-sm">
              Spam<span className="text-primary">Guard</span> API Documentation
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Integrate enterprise-grade email validation into your application with just a few lines of code.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-1 p-4 bg-card/30 backdrop-blur-md rounded-2xl border border-border/40 shadow-inner">
                <div className="flex items-center gap-2 px-3 mb-2 mt-2 font-semibold text-foreground tracking-tight text-sm uppercase">
                  <Cpu className="h-4 w-4 text-primary" /> Basics
                </div>
                <NavItem href="#introduction" label="Introduction" id="introduction" />
                <NavItem href="#authentication" label="Authentication" id="authentication" />
                <NavItem href="#quickstart" label="Quick Start" id="quickstart" />

                <div className="flex items-center gap-2 px-3 mb-2 mt-6 font-semibold text-foreground tracking-tight text-sm uppercase">
                  <Terminal className="h-4 w-4 text-primary" /> Endpoints
                </div>
                <NavItem href="#validate-single" label="Validate Single" id="validate-single" />

                <div className="flex items-center gap-2 px-3 mb-2 mt-6 font-semibold text-foreground tracking-tight text-sm uppercase">
                  <ListChecks className="h-4 w-4 text-primary" /> Reference
                </div>
                <NavItem href="#status-codes" label="Status Codes" id="status-codes" />
                <NavItem href="#rate-limits" label="Rate Limits" id="rate-limits" />
                <NavItem href="#error-handling" label="Error Handling" id="error-handling" />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-16 pb-24">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><BookOpen className="h-6 w-6 text-primary" /></div>
                Introduction
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Welcome to the TrueValidator REST API. Our enterprise-grade API allows you to validate email addresses
                programmatically with industry-leading accuracy, advanced SMTP simulation, and sub-second latency.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: Zap, title: "50ms Response", desc: "Avg endpoint latency", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                  { icon: Check, title: "99.99% Uptime", desc: "Mission-critical SLA", color: "text-green-500", bg: "bg-green-500/10" },
                  { icon: Terminal, title: "RESTful", desc: "Standard JSON schema", color: "text-blue-500", bg: "bg-blue-500/10" }
                ].map((item, idx) => (
                  <Card key={idx} className="bg-card/40 backdrop-blur-sm border-border/40 hover:bg-card/60 transition-colors shadow-sm">
                    <CardContent className="p-6">
                      <div className={`h-10 w-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Key className="h-6 w-6 text-primary" /></div>
                Authentication
              </h2>
              <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 md:p-8 shadow-sm">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  All API requests must be authenticated via a Bearer token. Include your API key in the
                  <code className="mx-1.5 px-2 py-0.5 bg-muted text-foreground font-semibold rounded text-sm">Authorization</code> header of your HTTP request.
                </p>
                <div className="bg-[#0d1117] border border-border/40 rounded-xl p-4 relative font-mono text-sm overflow-hidden shadow-inner flex items-center">
                  <div className="flex-1 overflow-x-auto text-[#e6edf3] pb-2 custom-scrollbar whitespace-nowrap">
                    <span className="text-[#79c0ff]">Authorization</span>
                    <span className="opacity-70">:</span>
                    <span className="ml-2">Bearer </span>
                    <span className="text-[#a5d6ff]">YOUR_API_KEY</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-4 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0"
                    onClick={() => handleCopyCode('Authorization: Bearer YOUR_API_KEY')}
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 text-sm text-muted-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
                  <p>
                    Generate and manage your secure API keys within your{' '}
                    <Link to={isAuthenticated ? "/api-keys" : "/register"} className="text-primary font-medium hover:underline">Developer Vault</Link>.
                    Never expose these keys in client-side code.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quickstart" className="scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Terminal className="h-6 w-6 text-primary" /></div>
                Quick Start
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Initialize your first validation request. Choose your preferred language below:
              </p>

              <div className="border border-border/40 rounded-2xl overflow-hidden shadow-xl bg-card/60 backdrop-blur-md">
                <div className="flex overflow-x-auto border-b border-border/40 bg-muted/30 hide-scrollbar">
                  {Object.keys(codeExamples).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang as keyof typeof codeExamples)}
                      className={`px-6 py-3.5 text-sm font-semibold capitalize whitespace-nowrap transition-all ${activeTab === lang
                        ? 'bg-transparent text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-b-2 border-transparent'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="relative bg-[#0d1117] flex">
                  <pre className="flex-1 p-6 overflow-x-auto text-sm font-mono text-[#e6edf3] leading-relaxed custom-scrollbar">
                    <code>{codeExamples[activeTab]}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 z-10 shrink-0"
                    onClick={() => handleCopyCode(codeExamples[activeTab])}
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </section>

            {/* Validate Single */}
            <section id="validate-single" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Validate Single Email</h2>
                <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border border-green-500/20 uppercase tracking-widest font-bold">Live</Badge>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">
                Execute synchronous validation against a single target email address.
              </p>

              <div className="space-y-8">
                {/* Endpoint */}
                <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm font-semibold">POST</Badge>
                  <code className="text-lg font-mono text-foreground font-semibold flex-1 overflow-x-auto custom-scrollbar whitespace-nowrap">https://api.truevalidator.dev/api/validate/single</code>
                </div>

                {/* Request */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ListChecks className="h-5 w-5 text-muted-foreground" /> Request Payload</h3>
                  <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground">
                          <tr>
                            <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Parameter</th>
                            <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Type</th>
                            <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Required</th>
                            <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          <tr className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-6 font-mono text-primary font-medium whitespace-nowrap">email</td>
                            <td className="py-4 px-6 whitespace-nowrap"><Badge variant="outline" className="font-mono font-normal">string</Badge></td>
                            <td className="py-4 px-6 whitespace-nowrap"><span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-semibold">Yes</span></td>
                            <td className="py-4 px-6 text-muted-foreground min-w-[200px]">The target email address to process.</td>
                          </tr>
                          <tr className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-6 font-mono text-primary font-medium whitespace-nowrap">options.verifySMTP</td>
                            <td className="py-4 px-6 whitespace-nowrap"><Badge variant="outline" className="font-mono font-normal">boolean</Badge></td>
                            <td className="py-4 px-6 whitespace-nowrap"><span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-semibold">No</span></td>
                            <td className="py-4 px-6 text-muted-foreground min-w-[200px]">Enable deep SMTP handshake simulation. Default: <code className="font-mono text-foreground">true</code></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Terminal className="h-5 w-5 text-muted-foreground" /> Response Object</h3>
                  <div className="relative bg-[#0d1117] flex rounded-2xl border border-border/40 overflow-hidden shadow-xl">
                    <pre className="flex-1 p-6 overflow-x-auto text-sm font-mono text-[#e6edf3] leading-relaxed custom-scrollbar">
                      <code>{responseExample}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 z-10 shrink-0"
                      onClick={() => handleCopyRes(responseExample)}
                    >
                      {copiedRes ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Status Codes */}
            <section id="status-codes" className="scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Validation Status Codes</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {statusCodes.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-5 bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl hover:border-primary/20 transition-all shadow-sm">
                    <div className={`mt-1 h-3 w-3 rounded-full ${item.color} shadow-[0_0_10px_currentColor] shrink-0`} />
                    <div className="min-w-0">
                      <h4 className="font-bold font-mono tracking-tight text-foreground capitalize mb-1 truncate">{item.status.replace('_', ' ')}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed break-words">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Platform Rate Limits</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                API throughput limits are actively enforced based on your provisioned plan.
              </p>
              <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border/40">
                      <tr>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Subscription Tier</th>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Enforced Throughput</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-medium whitespace-nowrap">Hobby / Free</td><td className="py-4 px-6 font-mono text-muted-foreground whitespace-nowrap">60 req / min</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-medium whitespace-nowrap">Developer</td><td className="py-4 px-6 font-mono text-muted-foreground whitespace-nowrap">300 req / min</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-medium whitespace-nowrap">Growth</td><td className="py-4 px-6 font-mono text-primary whitespace-nowrap">1,000 req / min</td></tr>
                      <tr className="hover:bg-muted/10 bg-primary/5"><td className="py-4 px-6 font-bold text-primary whitespace-nowrap">Enterprise Node</td><td className="py-4 px-6 font-mono text-primary font-bold whitespace-nowrap">5,000+ req / min</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Error Handling */}
            <section id="error-handling" className="scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Exception Handling</h2>
              <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border/40">
                      <tr>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">HTTP Code</th>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Exception Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-mono text-green-500 font-medium whitespace-nowrap">200 OK</td><td className="py-4 px-6 text-muted-foreground min-w-[250px]">Request executed successfully</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-mono text-yellow-500 font-medium whitespace-nowrap">400 Bad Request</td><td className="py-4 px-6 text-muted-foreground min-w-[250px]">Malformed payload or strictly invalid email string</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-mono text-red-500 font-medium whitespace-nowrap">401 Unauthorized</td><td className="py-4 px-6 text-muted-foreground min-w-[250px]">Missing, revoked, or invalid API key credential</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-mono text-orange-500 font-medium whitespace-nowrap">402 Payment Required</td><td className="py-4 px-6 text-muted-foreground min-w-[250px]">Compute ledger depleted (insufficient credits)</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-mono text-orange-500 font-medium whitespace-nowrap">429 Too Many Requests</td><td className="py-4 px-6 text-muted-foreground min-w-[250px]">Rate limit threshold exceeded for current tier</td></tr>
                      <tr className="hover:bg-muted/10"><td className="py-4 px-6 font-mono text-red-500 font-medium whitespace-nowrap">500 Internal Server Error</td><td className="py-4 px-6 text-muted-foreground min-w-[250px]">Upstream validation engine failure</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
