import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  CheckCircle,
  Upload,
  History,
  Key,
  CreditCard,
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Shield,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Verify Email', href: '/validate/single', icon: CheckCircle },
  { name: 'Bulk Verify', href: '/validate/bulk', icon: Upload },
  { name: 'Validation Logs', href: '/history', icon: History },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Plans & Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const location = useLocation();

  // Refresh user data on route changes to keep credits in sync
  useEffect(() => {
    refreshUser();
  }, [location.pathname]);

  // Periodic refresh every 30s for background job completions
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 relative overflow-hidden group ${isActive
      ? 'bg-primary/10 text-primary shadow-inner border border-primary/20'
      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border border border-transparent'
    }`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] opacity-50 mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[150px] opacity-30 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 z-50 w-72 flex-col border-r border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Logo */}
        <div className="h-20 flex items-center gap-4 px-6 border-b border-border/40 relative z-10">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent block">True<span className="text-primary tracking-tight">Validator</span></span>
            <span className="text-[10px] text-primary/80 font-mono font-bold uppercase tracking-widest block drop-shadow-sm">Email Validation</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={navLinkClass}
            >
              <item.icon className="h-5 w-5 shrink-0 z-10 relative" />
              <span className="z-10 relative">{item.name}</span>
              {/* Hover Effect Layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Admin Link */}
        {user?.role === 'admin' && (
          <div className="px-4 py-2">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group relative overflow-hidden ${isActive
                  ? 'bg-red-500/15 text-red-400 shadow-[inset_0_1px_0_rgba(239,68,68,0.2)]'
                  : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-400'
                }`
              }
            >
              <Shield className="h-5 w-5 shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}

        {/* Credits Card */}
        <div className="p-5 border-t border-border/40 relative z-10 bg-background/30 mt-auto">
          <div className="bg-gradient-to-br from-background/80 to-muted/50 rounded-xl p-5 border border-border/50 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-yellow-500/10 blur-[40px] rounded-full group-hover:bg-yellow-500/20 transition-colors pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="bg-yellow-500/10 p-2 rounded-lg ring-1 ring-yellow-500/30 shadow-inner">
                <Zap className="h-5 w-5 text-yellow-500 drop-shadow-sm" />
              </div>
              <Badge variant="outline" className="bg-background/50 text-[10px] uppercase font-bold tracking-widest text-muted-foreground shadow-sm">
                {user?.plan?.name ? user?.plan?.name : 'Hobby'}
              </Badge>
            </div>

            <div className="relative z-10">
              <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Credits Remaining</div>
              <div className="text-3xl font-black text-foreground drop-shadow-sm truncate">{user?.credits?.toLocaleString() || 0}</div>
            </div>

            <Button asChild variant="default" size="sm" className="w-full mt-4 shadow-[0_0_15px_rgba(var(--primary),0.15)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] transition-all relative z-10">
              <NavLink to="/billing">Buy Credits</NavLink>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col min-w-0 flex-1 lg:pl-72 min-h-screen relative z-10 transition-all duration-300">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 h-20 border-b border-border/40 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="h-10 w-10 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner">
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 border-r border-border/40 bg-card/90 backdrop-blur-3xl shadow-2xl">
              <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
              <SheetDescription className="sr-only">App dashboard and settings navigation</SheetDescription>
              <div className="h-20 flex items-center justify-between px-6 border-b border-border/40">
                <div className="flex items-center gap-4">
                  <NavLink to="/" className="flex items-center gap-3 relative group">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xl tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent block">True<span className="text-primary tracking-tight">Validator</span></span>
                      <span className="text-[10px] text-primary/80 font-mono font-bold uppercase tracking-widest block drop-shadow-sm">Email Validation</span>
                    </div>
                  </NavLink>
                </div>
              </div>
              <nav className="p-5 space-y-2 overflow-y-auto custom-scrollbar h-[calc(100vh-5rem)]">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 z-10 relative" />
                    <span className="z-10 relative">{item.name}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Page Title - Mobile */}
          <div className="lg:hidden font-bold tracking-tight text-lg text-foreground mt-1 ml-4 sm:ml-0 flex-1 truncate">
            {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10 transition-colors shadow-inner mr-2">
              <NavLink to="/billing"><Zap className="h-3.5 w-3.5 mr-2" />Buy Credits</NavLink>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner rounded-full overflow-hidden"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-10 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner rounded-full pl-2 pr-4 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-semibold text-sm mr-1">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-xl">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-foreground truncate">{user?.name}</span>
                    <span className="text-xs font-mono text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 mx-2" />
                <div className="p-1 space-y-1">
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
                    <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />
                      My Profile
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
                    <NavLink to="/billing" className="flex items-center gap-3 px-3 py-2 text-sm font-medium">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Plans & Billing
                    </NavLink>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-border/50 mx-2" />
                <div className="p-1">
                  <DropdownMenuItem onClick={logout} className="rounded-lg text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer flex items-center gap-3 px-3 py-2 text-sm font-medium">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 mt-20 overflow-y-auto relative z-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
