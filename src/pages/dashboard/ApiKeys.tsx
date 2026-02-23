import { useEffect, useState } from 'react';
import { apiKeysApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Loader2,
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  preview: string;
  key?: string;
  usage_count: number;
  rate_limit_per_minute: number;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchKeys = async () => {
    try {
      const response = await apiKeysApi.getKeys();
      setKeys(response.data.data.keys);
    } catch (error) {
      toast.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiKeysApi.createKey({ name: newKeyName });
      setNewKey(response.data.data.key);
      setKeys((prev) => [...prev, response.data.data.key]);
      setNewKeyName('');
      toast.success('API key created successfully!');
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('API key copied to clipboard!');
  };

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      await apiKeysApi.updateKey(keyId, { is_active: !isActive });
      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, is_active: !isActive } : k))
      );
      toast.success(`API key ${isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeysApi.deleteKey(keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleCloseDialog = () => {
    setNewKey(null);
    setShowKey(false);
    setCopied(false);
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
            API Keys
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage API keys for programmatic access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]">
              <Plus className="h-5 w-5 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-primary/20 bg-card/90 backdrop-blur-xl shadow-2xl">
            {!newKey ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Generate API Key</DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                    Give your API key a name so you can identify it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Production App, Test Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="h-12 bg-background/50 focus:bg-background transition-colors text-lg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog} className="border-border/50">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={isCreating} className="shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Generate Key'
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl text-green-500 font-bold">
                    <CheckCircle className="h-6 w-6" />
                    Key Created
                  </DialogTitle>
                  <DialogDescription>
                    <span className="text-destructive font-bold text-sm bg-destructive/10 px-3 py-1.5 rounded-md inline-block mt-2">
                      ⚠️ Copy this key now. It won't be shown again.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="p-5 bg-background shadow-inner border border-primary/20 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Your API Key</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <code className="flex-1 p-3 bg-muted/60 rounded-md text-sm font-mono break-all ring-1 ring-border/50 shadow-inner">
                        {showKey ? newKey.key : newKey.preview}
                      </code>
                      <Button
                        variant={copied ? "default" : "outline"}
                        size="icon"
                        className={`h-10 w-10 shrink-0 ${copied ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-600' : 'hover:bg-primary/10 hover:text-primary hover:border-primary/50'}`}
                        onClick={() => handleCopyKey(newKey.key!)}
                      >
                        {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-yellow-500/90 leading-relaxed">
                      Store this key in a safe place. If you lose it, you'll need to create a new one.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseDialog} size="lg" className="w-full">Done</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys List */}
      {keys.length === 0 ? (
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-40 bg-primary/5 blur-[120px] rounded-full pointer-events-none w-full h-full" />
          <CardContent className="flex flex-col items-center justify-center py-24 relative z-10">
            <div className="p-6 bg-muted/30 rounded-full mb-6 ring-1 ring-border/50">
              <Key className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">No API Keys</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-sm">
              You haven't created any API keys yet. Create one to start integrating.
            </p>
            <Button size="lg" className="shadow-[0_0_20px_rgba(var(--primary),0.2)]" onClick={() => setDialogOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {keys.map((key) => (
            <Card key={key.id} className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all duration-300 group overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-foreground tracking-tight">{key.name}</h3>
                        <div className="scale-90 origin-left">
                          <Badge variant={key.is_active ? 'default' : 'secondary'} className={key.is_active ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'opacity-70'}>
                            {key.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 mb-3 px-2 py-1 bg-background/60 shadow-inner rounded-md border border-border/50">
                        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">PREFIX</span>
                        <span className="text-sm text-foreground font-mono">{key.preview}</span>
                      </div>
                      <div className="grid grid-cols-2 lg:flex lg:items-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Zap className="h-3 w-3" /> {(key.usage_count).toLocaleString()} requests
                        </span>
                        <span className="flex items-center gap-1.5 opacity-70">
                          {key.rate_limit_per_minute} req/min
                        </span>
                        {key.last_used_at && (
                          <span className="flex items-center gap-1.5 col-span-2 lg:col-span-1">
                            Last used: <span className="text-primary font-mono">{new Date(key.last_used_at).toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-background/50 p-2 rounded-xl border border-border/50 shadow-inner w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
                    <div className="flex items-center space-x-2 pl-2">
                      <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground cursor-pointer" htmlFor={`switch-${key.id}`}>State</Label>
                      <Switch
                        id={`switch-${key.id}`}
                        checked={key.is_active}
                        onCheckedChange={() => handleToggleKey(key.id, key.is_active)}
                        className="data-[state=checked]:bg-primary shadow-inner"
                      />
                    </div>
                    <div className="w-px h-6 bg-border/50 hidden md:block" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* API Documentation Card */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <CardHeader className="border-b border-border/40 pb-5 relative z-10">
          <CardTitle className="text-xl">API Documentation</CardTitle>
          <CardDescription>
            Everything you need to integrate with our API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 relative z-10">
          <div className="p-5 bg-background/50 border border-border/50 rounded-xl shadow-inner group transition-colors hover:bg-background/80 hover:border-primary/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Base URL</p>
            <code className="px-3 py-2 bg-muted/60 rounded-md text-[13px] font-mono text-primary shadow-sm ring-1 ring-primary/20">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </code>
          </div>

          <div className="p-5 bg-background/50 border border-border/50 rounded-xl shadow-inner group transition-colors hover:bg-background/80 hover:border-primary/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Authorization Header</p>
            <p className="text-sm text-foreground mb-3 font-medium">
              Include your API key in the request header:
            </p>
            <code className="px-3 py-2 bg-muted/60 rounded-md text-[13px] font-mono text-primary shadow-sm ring-1 ring-primary/20 block w-fit">
              X-API-Key: &lt;your_api_key&gt;
            </code>
          </div>

          <div className="p-5 bg-card/80 border border-border/80 rounded-xl shadow-xl overflow-hidden group">
            <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">cURL Example</p>
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 ring-1 ring-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20 ring-1 ring-yellow-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/20 ring-1 ring-green-500/50" />
              </div>
            </div>
            <pre className="text-xs font-mono text-foreground overflow-x-auto select-all leading-loose">
              <span className="text-blue-400">curl</span> <span className="text-muted-foreground">-X</span> POST \
              {'\n'}  <span className="text-green-400">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/validate/single</span> \
              {'\n'}  <span className="text-muted-foreground">-H</span> <span className="text-yellow-300">"X-API-Key: your_api_key_here"</span> \
              {'\n'}  <span className="text-muted-foreground">-H</span> <span className="text-yellow-300">"Content-Type: application/json"</span> \
              {'\n'}  <span className="text-muted-foreground">-d</span> <span className="text-yellow-300">'{'{"email": "contact@enterprise.com"}'}'</span>
            </pre>
          </div>
          <div className="pt-2">
            <Button variant="outline" size="lg" className="w-full sm:w-auto shadow-sm border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300 group" asChild>
              <a href="/docs">
                View Full Documentation
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
