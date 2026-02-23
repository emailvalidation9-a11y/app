import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Gdpr() {
  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full min-h-screen">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Shield className="h-3.5 w-3.5 mr-2 inline-block" /> Legal
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-foreground drop-shadow-sm">
            GDPR Compliance
          </h1>
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/40 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-invert max-w-none text-muted-foreground">
              <h2 className="text-2xl font-bold text-foreground mb-4">We Are Data Processors</h2>
              <p className="mb-6 leading-relaxed">Under GDPR, we act as a "Data Processor" when you use our service to validate your email lists. We only process the email addresses to check if they are valid, and we do not use this data for any other purpose.</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">No Data Retention</h2>
              <p className="mb-6 leading-relaxed">We delete all emails immediately after processing them. We do not store, log, or keep your email lists. You maintain complete ownership and control of your data.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}