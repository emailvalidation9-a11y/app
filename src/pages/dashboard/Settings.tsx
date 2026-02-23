import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, accountApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';
import {
  Loader2,
  User,
  Lock,
  Bell,
  Shield,
  Mail,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function Settings() {
  const { user, refreshUser } = useAuth();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Activity log state
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await accountApi.getActivityLog(1, 10);
      setActivities(res.data.data.activities);
    } catch {
      // silent fail
    } finally {
      setActivityLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      await accountApi.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: '🔑 Login',
      register: '🎉 Registration',
      password_change: '🔒 Password Changed',
      profile_update: '✏️ Profile Updated',
      email_verified: '✅ Email Verified',
      validation_single: '📧 Single Validation',
      validation_bulk: '📦 Bulk Validation',
      credit_purchase: '💳 Credit Purchase',
      plan_upgrade: '⬆️ Plan Upgrade',
      api_key_created: '🔑 API Key Created',
      api_key_deleted: '🗑️ API Key Deleted',
      export_results: '📥 Results Exported',
      webhook_triggered: '🔔 Webhook Sent',
    };
    return labels[action] || action;
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await authApi.updateProfile({ name });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your profile, password, and account preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="border-primary/10 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-primary/30">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <CardHeader className="relative z-10 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20 shadow-inner">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Profile</CardTitle>
              <CardDescription className="text-base mt-1">
                Update your name and view your account email
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email}
                disabled
                className="bg-muted/50 border-muted opacity-80 h-12"
              />
              <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5 mt-1">
                <Lock className="h-3 w-3" /> Email cannot be changed
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-background/50 focus:bg-background transition-colors"
                placeholder="Enter your name"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              className="px-8 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all duration-300"
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile || name === user?.name}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="border-red-500/10 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-red-500/20">
        <div className="absolute bottom-0 left-0 p-32 bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
        <CardHeader className="relative z-10 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center ring-1 ring-red-500/20 shadow-inner">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Change Password</CardTitle>
              <CardDescription className="text-base mt-1">
                Update your account password
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="currentPassword" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 pr-12 bg-background/50 focus:bg-background transition-colors"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 pr-12 bg-background/50 focus:bg-background transition-colors"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 bg-background/50 focus:bg-background transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              variant="destructive"
              className="px-8 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300"
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Notification Settings */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl hover:border-border transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Bell className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Notifications</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Manage email notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-md text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Email Notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Job completion and low credit alerts
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled className="bg-transparent opacity-50">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl hover:border-border transition-colors relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <Shield className="h-48 w-48 -mr-12 -mb-12" />
          </div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Authentication</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-md text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled className="bg-transparent opacity-50">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription className="mt-1">Your latest account events and actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activityLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : activities.length > 0 ? (
            <div className="divide-y divide-border/40">
              {activities.map((activity: any) => (
                <div key={activity._id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{getActionLabel(activity.action)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone - Account Deletion */}
      <Card className="border-red-500/30 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <CardHeader className="border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-red-500">Danger Zone</CardTitle>
              <CardDescription className="mt-1">Irreversible and destructive actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <h3 className="font-semibold text-sm text-foreground mb-1">Delete Account</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Once you delete your account, all your data including validation history, API keys, transactions, and usage analytics will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="h-10 max-w-xs bg-background/50 border-red-500/20 focus:border-red-500/50"
              />
              <Button
                variant="destructive"
                size="sm"
                className="px-6"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirm !== 'DELETE'}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
