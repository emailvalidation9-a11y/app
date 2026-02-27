import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    LayoutDashboard, Users, Activity, CreditCard, Settings, Shield,
    Sun, Moon, LogOut, Menu, ChevronDown, Zap, ArrowLeft, Key, ClipboardList,
    FileText, Globe, Inbox, Server, Tag
} from 'lucide-react';

const adminNavItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Validation Jobs', href: '/admin/jobs', icon: Activity },
    { name: 'Validation Servers', href: '/admin/servers', icon: Server },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { name: 'API Keys', href: '/admin/api-keys', icon: Key },
    { name: 'Pricing & Coupons', href: '/admin/pricing', icon: Tag },
    { name: 'Activity Log', href: '/admin/activity', icon: ClipboardList },
    { name: 'System Config', href: '/admin/config', icon: Settings },
    { name: 'Site Settings', href: '/admin/settings', icon: Globe },
    { name: 'Blog Engine', href: '/admin/blog', icon: FileText },
    { name: 'Communications', href: '/admin/inbox', icon: Inbox },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const { setTheme, resolvedTheme } = useTheme();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${isActive
            ? 'bg-red-500/15 text-red-400 shadow-[inset_0_1px_0_rgba(239,68,68,0.2),0_0_12px_rgba(239,68,68,0.08)]'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-border/40">
                <Link to="/admin" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500/30 to-red-500/5 flex items-center justify-center ring-1 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:scale-105 transition-transform">
                        <Shield className="h-5 w-5 text-red-400 drop-shadow-sm" />
                    </div>
                    <div>
                        <span className="font-extrabold text-lg tracking-tight block">
                            TrueValidator<span className="text-red-400">Admin</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Control Center</span>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {adminNavItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/admin'}
                        className={navLinkClass}
                        onClick={() => setMobileOpen(false)}
                    >
                        <item.icon className="h-4.5 w-4.5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Back to App */}
            <div className="p-4 border-t border-border/40">
                <Button asChild variant="outline" className="w-full justify-start gap-2 h-11 border-border/50 text-muted-foreground hover:text-foreground">
                    <Link to="/dashboard">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-72 border-r border-border/40 bg-card/30 backdrop-blur-2xl fixed inset-y-0 left-0 z-40">
                <SidebarContent />
            </aside>

            {/* Main */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu */}
                        <div className="lg:hidden">
                            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-border/50">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 p-0 border-r border-border/40 bg-card/95 backdrop-blur-3xl flex flex-col">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground/80 tracking-wide">
                                {adminNavItems.find((i) => location.pathname === i.href || (i.href !== '/admin' && location.pathname.startsWith(i.href)))?.name || 'Admin Panel'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline" size="icon"
                            className="h-9 w-9 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner rounded-full"
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        >
                            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2 h-9 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner rounded-full pl-1.5 pr-3 hover:bg-muted/50 transition-colors">
                                    <Avatar className="h-6 w-6 ring-2 ring-background shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-red-500/80 to-red-600 text-white text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline font-semibold text-sm mr-1">{user?.name}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-xl">
                                <DropdownMenuLabel className="p-2">
                                    <span className="font-bold text-foreground block truncate">{user?.name}</span>
                                    <span className="text-xs font-mono text-muted-foreground truncate">{user?.email}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50 mx-2" />
                                <DropdownMenuItem asChild className="rounded-lg hover:bg-primary/10 cursor-pointer">
                                    <Link to="/dashboard" className="w-full flex items-center">
                                        <Zap className="h-4 w-4 mr-2 text-muted-foreground" /> User Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50 mx-2" />
                                <DropdownMenuItem onClick={logout} className="rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer font-medium">
                                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
