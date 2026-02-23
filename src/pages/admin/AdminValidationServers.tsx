import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit3,
  TestTube,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface ValidationServer {
  _id: string;
  name: string;
  url: string;
  isActive: boolean;
  isHealthy: boolean;
  weight: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  lastHealthCheck: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminValidationServers() {
  const [servers, setServers] = useState<ValidationServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ValidationServer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    weight: 1,
    isActive: true
  });
  const [showTestResults, setShowTestResults] = useState<{ [key: string]: any }>({});
  const [testLoading, setTestLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getServers();
      setServers(response.data.data.servers);
    } catch (error) {
      console.error('Error fetching servers:', error);
      toast.error('Failed to fetch validation servers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingServer) {
        // Update existing server
        await adminApi.updateServer(editingServer._id, formData);
        toast.success('Server updated successfully');
      } else {
        // Create new server
        await adminApi.createServer(formData);
        toast.success('Server created successfully');
      }

      setIsModalOpen(false);
      setEditingServer(null);
      setFormData({ name: '', url: '', weight: 1, isActive: true });
      fetchServers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save server');
    }
  };

  const handleEdit = (server: ValidationServer) => {
    setEditingServer(server);
    setFormData({
      name: server.name,
      url: server.url,
      weight: server.weight,
      isActive: server.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this validation server?')) {
      try {
        await adminApi.deleteServer(id);
        toast.success('Server deleted successfully');
        fetchServers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete server');
      }
    }
  };

  const handleTest = async (serverId: string, url?: string) => {
    try {
      setTestLoading(prev => ({ ...prev, [serverId]: true }));

      const response = await adminApi.testServer(serverId, url ? { url } : {});
      const result = response.data.data;

      setShowTestResults(prev => ({
        ...prev,
        [serverId]: result
      }));

      toast.success(`Server test ${result.isHealthy ? 'passed' : 'failed'}`);
    } catch (error: any) {
      toast.error('Failed to test server');
    } finally {
      setTestLoading(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const handleToggleStatus = async (serverId: string, isHealthy: boolean) => {
    try {
      await adminApi.updateServerHealth(serverId, { isHealthy });
      toast.success(`Server marked as ${isHealthy ? 'healthy' : 'unhealthy'}`);
      fetchServers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update server status');
    }
  };

  const getStatusBadge = (server: ValidationServer) => {
    if (!server.isActive) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Inactive</Badge>;
    }

    if (!server.isHealthy) {
      return <Badge variant="outline" className="bg-red-100 text-red-600 border-red-300">Unhealthy</Badge>;
    }

    return <Badge variant="outline" className="bg-green-100 text-green-600 border-green-300">Healthy</Badge>;
  };

  const getHealthIcon = (server: ValidationServer) => {
    if (!server.isActive) {
      return <XCircle className="h-4 w-4 text-gray-500" />;
    }

    if (!server.isHealthy) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          Validation Servers
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and monitor your email validation infrastructure
        </p>
      </div>

      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Server Management</CardTitle>
              <CardDescription>Configure and monitor validation server infrastructure</CardDescription>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingServer(null);
                  setFormData({ name: '', url: '', weight: 1, isActive: true });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingServer ? 'Edit Server' : 'Add New Server'}</DialogTitle>
                  <DialogDescription>
                    Configure the validation server details
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Server Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">Server URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="http://server.domain.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (1-10)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingServer ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="all">All Servers</TabsTrigger>
              <TabsTrigger value="health">Health Status</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.filter(s => s.isActive).map((server) => (
                    <TableRow key={server._id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{server.url}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(server)}
                          {getStatusBadge(server)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{server.weight}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-4">
                            <span>SR: {server.successRate}%</span>
                            <span>RT: {server.avgResponseTime}ms</span>
                            <span>Req: {server.totalRequests}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTest(server._id)}
                            disabled={testLoading[server._id]}
                          >
                            {testLoading[server._id] ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(server)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(server._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.map((server) => (
                    <TableRow key={server._id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{server.url}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(server)}
                          {getStatusBadge(server)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{server.weight}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{server.createdBy.name}</div>
                          <div className="text-muted-foreground">{server.createdBy.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTest(server._id)}
                            disabled={testLoading[server._id]}
                          >
                            {testLoading[server._id] ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(server)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(server._id, !server.isHealthy)}
                          >
                            {server.isHealthy ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(server._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="health" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {servers.map((server) => (
                  <Card key={server._id} className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{server.name}</CardTitle>
                        {getStatusBadge(server)}
                      </div>
                      <CardDescription className="font-mono text-sm">{server.url}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{server.weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className={`font-medium ${server.successRate >= 95 ? 'text-green-500' : server.successRate >= 80 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {server.successRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Response:</span>
                          <span className="font-medium">{server.avgResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Requests:</span>
                          <span className="font-medium">{server.totalRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="font-medium text-xs">
                            {new Date(server.lastHealthCheck).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTest(server._id)}
                            disabled={testLoading[server._id]}
                            className="flex-1"
                          >
                            {testLoading[server._id] ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <TestTube className="h-4 w-4 mr-2" />
                            )}
                            Test
                          </Button>

                          {showTestResults[server._id] && (
                            <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                              <div className="font-medium mb-1">Test Results:</div>
                              <div>Status: {showTestResults[server._id].isHealthy ? 'Healthy' : 'Unhealthy'}</div>
                              <div>Response Time: {showTestResults[server._id].responseTime}ms</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}