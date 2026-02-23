import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

export default function Terms() {
  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full min-h-screen">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Terminal className="h-3.5 w-3.5 mr-2 inline-block" /> Legal
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-foreground drop-shadow-sm">
            Terms of Service
          </h1>
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/40 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-invert max-w-none text-muted-foreground">
              <h2 className="text-2xl font-bold text-foreground mb-4">Acceptable Use</h2>
              <p className="mb-6 leading-relaxed">By using our API and services, you agree not to abuse or overwhelm our systems artificially. You must use a valid API token for all programmatic access to the tool.</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">Service Reliability</h2>
              <p className="mb-6 leading-relaxed">We strive to keep our verification tool up and running 24/7. However, if there happens to be an outage, we will post updates and fix the issue as quickly as possible.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}