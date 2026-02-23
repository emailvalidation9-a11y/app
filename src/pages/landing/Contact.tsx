import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Mail, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '@/services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await publicApi.getSettings();
        setSettings(res.data?.data?.settings || {});
      } catch (error) {
        console.error("Failed to load settings");
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await publicApi.submitContact(formData);
      toast.success('Message sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full min-h-screen">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <MessageSquare className="h-3.5 w-3.5 mr-2 inline-block" /> Support
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-foreground drop-shadow-sm">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Need help or have questions about our tool? Send us a message and we'll reply as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="mb-8 relative shrink-0">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Get in touch</h2>
                <p className="text-muted-foreground">Fill out the form and our team will get back to you within 24 hours.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                <Card className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/50 transition-all shadow-md">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/20">
                      <Terminal className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Enterprise Sales</h3>
                    <p className="text-sm text-muted-foreground mb-4">Validate millions of emails per month.</p>
                    <Button variant="outline" className="w-full font-bold h-10 overflow-hidden" asChild>
                      <a href={`mailto:${settings?.contactInfo?.salesEmail || 'sales@spamguard.dev'}`}>
                        {settings?.contactInfo?.salesEmail || 'sales@spamguard.dev'}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-blue-500/50 transition-all shadow-md">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
                      <Mail className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">Technical or billing assistance.</p>
                    <Button variant="outline" className="w-full font-bold h-10 overflow-hidden" asChild>
                      <a href={`mailto:${settings?.contactInfo?.supportEmail || 'support@spamguard.dev'}`}>
                        {settings?.contactInfo?.supportEmail || 'support@spamguard.dev'}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-card/40 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden h-fit">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <Input required placeholder="Jane Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input required type="email" placeholder="jane@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input required placeholder="How can we help you?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea required placeholder="Tell us more about your inquiry..." className="min-h-[150px]" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold gap-2">
                    {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}