import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Server, Database, Shield, Clock, Cpu, AlertCircle } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
    'Server Environment': Server,
    'Database': Database,
    'Authentication': Shield,
    'Rate Limiting': Clock,
    'Validation Engine': Cpu
};

const colorMap: Record<string, { color: string; bg: string }> = {
    'Server Environment': { color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5' },
    'Database': { color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
    'Authentication': { color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5' },
    'Rate Limiting': { color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5' },
    'Validation Engine': { color: 'text-violet-400', bg: 'from-violet-500/20 to-violet-500/5' }
};

interface ConfigItem {
    label: string;
    value: string;
}

interface ConfigSection {
    title: string;
    items: ConfigItem[];
}

export default function AdminConfig() {
    const [config, setConfig] = useState<Record<string, ConfigSection> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await adminApi.getSystemConfig();
            setConfig(res.data.data.config);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load system config');
            toast.error('Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="border-border/40 bg-card/50 backdrop-blur">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <AlertCircle className="h-10 w-10 text-red-400" />
                <p className="text-muted-foreground">{error || 'Failed to load configuration'}</p>
            </div>
        );
    }

    const sections = Object.values(config);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sections.map((section) => {
                    const Icon = iconMap[section.title] || Server;
                    const colors = colorMap[section.title] || { color: 'text-primary', bg: 'from-primary/20 to-primary/5' };

                    return (
                        <Card key={section.title} className="border-border/40 bg-card/50 backdrop-blur">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center ring-1 ring-white/5`}>
                                        <Icon className={`h-5 w-5 ${colors.color}`} />
                                    </div>
                                    <h3 className="font-bold text-sm">{section.title}</h3>
                                </div>
                                <div className="space-y-3">
                                    {section.items.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                            <Badge
                                                variant="secondary"
                                                className={`font-mono text-xs ${item.value === 'Connected' ? 'bg-green-500/15 text-green-400 border-green-500/20' :
                                                        item.value === 'Disconnected' ? 'bg-red-500/15 text-red-400 border-red-500/20' : ''
                                                    }`}
                                            >
                                                {item.value}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
