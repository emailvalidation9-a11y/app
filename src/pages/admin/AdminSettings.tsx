import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, MapPin, Mail, Phone, Settings, Save, Twitter, Facebook, Linkedin, Instagram, Github, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [cfBrowserCheck, setCfBrowserCheck] = useState<'on' | 'off' | null>(null);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const [settingsRes, cfRes] = await Promise.all([
                adminApi.getSiteSettings(),
                adminApi.getCloudflareBrowserCheck().catch(() => null)
            ]);
            setSettings(settingsRes.data?.data?.settings || {});
            if (cfRes?.data?.data?.result?.value) {
                setCfBrowserCheck(cfRes.data.data.result.value);
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (section: string, field: string, value: string) => {
        setSettings((prev: any) => ({
            ...prev,
            [section]: {
                ...(prev?.[section] || {}),
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            await adminApi.updateSiteSettings(settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const handleCfToggle = async (checked: boolean) => {
        const newValue = checked ? 'on' : 'off';
        const previousValue = cfBrowserCheck;
        setCfBrowserCheck(newValue);
        try {
            await adminApi.updateCloudflareBrowserCheck(newValue);
            toast.success(`Cloudflare Browser Check set to ${newValue}`);
        } catch (error) {
            toast.error('Failed to update Cloudflare setting');
            setCfBrowserCheck(previousValue);
        }
    };

    if (isLoading) {
        return <div className="p-8 animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] relative z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <Settings className="h-6 w-6 text-primary" /> Configuration
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Manage social media links and contact information.</p>
                </div>
                <Button onClick={handleSave} className="gap-2 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                    <Save className="h-4 w-4" /> Save Changes
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Cloudflare Security */}
                <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-500" /> Cloudflare Security</CardTitle>
                        <CardDescription>Manage domain security policies directly via Cloudflare API.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                            <div>
                                <Label className="text-base font-semibold">Browser Integrity Check</Label>
                                <p className="text-sm text-muted-foreground mt-1">Evaluate HTTP requests to block malicious bots and automated scrapers before they reach your server.</p>
                            </div>
                            <Switch
                                checked={cfBrowserCheck === 'on'}
                                onCheckedChange={handleCfToggle}
                                disabled={cfBrowserCheck === null}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-purple-500" /> Social Links</CardTitle>
                        <CardDescription>Full URLs to your public social media profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Twitter className="h-4 w-4 text-[#1DA1F2]" /> Twitter / X</Label>
                            <Input
                                placeholder="https://twitter.com/..."
                                value={settings?.socialMedia?.twitter || ''}
                                onChange={(e) => handleChange('socialMedia', 'twitter', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Facebook className="h-4 w-4 text-[#4267B2]" /> Facebook</Label>
                            <Input
                                placeholder="https://facebook.com/..."
                                value={settings?.socialMedia?.facebook || ''}
                                onChange={(e) => handleChange('socialMedia', 'facebook', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-[#0077b5]" /> LinkedIn</Label>
                            <Input
                                placeholder="https://linkedin.com/in/..."
                                value={settings?.socialMedia?.linkedin || ''}
                                onChange={(e) => handleChange('socialMedia', 'linkedin', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Instagram className="h-4 w-4 text-[#E1306C]" /> Instagram</Label>
                            <Input
                                placeholder="https://instagram.com/..."
                                value={settings?.socialMedia?.instagram || ''}
                                onChange={(e) => handleChange('socialMedia', 'instagram', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Github className="h-4 w-4 text-foreground/80" /> GitHub</Label>
                            <Input
                                placeholder="https://github.com/..."
                                value={settings?.socialMedia?.github || ''}
                                onChange={(e) => handleChange('socialMedia', 'github', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-500" /> Dispatch Info</CardTitle>
                        <CardDescription>Primary communication channels for public users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> General Email</Label>
                            <Input
                                placeholder="hello@truevalidator.dev"
                                value={settings?.contactInfo?.email || ''}
                                onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-400" /> Support Email</Label>
                            <Input
                                placeholder="support@truevalidator.dev"
                                value={settings?.contactInfo?.supportEmail || ''}
                                onChange={(e) => handleChange('contactInfo', 'supportEmail', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-green-400" /> Sales Email</Label>
                            <Input
                                placeholder="sales@truevalidator.dev"
                                value={settings?.contactInfo?.salesEmail || ''}
                                onChange={(e) => handleChange('contactInfo', 'salesEmail', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-500" /> Phone Number</Label>
                            <Input
                                placeholder="+1 (800) 123-4567"
                                value={settings?.contactInfo?.phone || ''}
                                onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500" /> HQ Address</Label>
                            <Input
                                placeholder="123 Datacenter Blvd..."
                                value={settings?.contactInfo?.address || ''}
                                onChange={(e) => handleChange('contactInfo', 'address', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
