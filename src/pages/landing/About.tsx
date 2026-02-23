import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Server } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full min-h-screen">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Server className="h-3.5 w-3.5 mr-2 inline-block" /> About Us
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-foreground drop-shadow-sm">
            What We Do
          </h1>
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/40 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-invert max-w-none text-muted-foreground">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="mb-6 leading-relaxed">Our mission is simple: to help you clean your email lists. We want to stop fake, misspelled, or dangerous emails from ruining your marketing campaigns or application databases.</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="mb-6 leading-relaxed">When you give us an email address, our tool runs several quick checks in the background. We check if the email format is correct, if the domain exists, and if the inbox can actually receive messages. We do this without sending any emails to the user, keeping the entire process fast and quiet.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}