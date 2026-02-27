import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Menu, Sun, Moon, LogOut, ChevronDown, Zap, LayoutDashboard, CreditCard,
    Twitter, Facebook, Linkedin, Instagram, Github, Mail, Phone
} from 'lucide-react';
import { publicApi } from '@/services/api';

export default function PublicLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const { setTheme, resolvedTheme } = useTheme();
    const location = useLocation();
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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Documentation', href: '/docs' },
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Abstract Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[60%] h-[50%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
            </div>

            {/* Header */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${scrolled ? 'h-16 bg-background/80 backdrop-blur-3xl shadow-sm border-border/40' : 'h-20 bg-transparent border-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-8 z-10">
                        <Link to="/" className="flex items-center gap-3 relative z-10 group">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center ring-1 ring-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)] group-hover:scale-105 transition-transform">
                                <Zap className="h-5 w-5 text-primary drop-shadow-sm" />
                            </div>
                            <div>
                                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent block">True<span className="text-primary">Validator</span></span>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Nav & Actions */}
                    <div className="hidden lg:flex items-center gap-4 z-10 ml-auto">
                        {/* Nav Links */}
                        <nav className="flex items-center gap-6 mr-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`text-sm font-semibold tracking-wide transition-colors hover:text-primary ${location.pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Theme Toggle */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner rounded-full shrink-0"
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        >
                            {resolvedTheme === 'dark' ? (
                                <Sun className="h-4 w-4 text-yellow-500" />
                            ) : (
                                <Moon className="h-4 w-4 text-indigo-500" />
                            )}
                        </Button>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Button asChild variant="outline" size="sm" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10 transition-colors shadow-inner shrink-0">
                                    <Link to="/dashboard"><LayoutDashboard className="h-3.5 w-3.5 mr-2" /> Application</Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex items-center gap-2 h-9 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner rounded-full pl-1.5 pr-3 hover:bg-muted/50 transition-colors">
                                            <Avatar className="h-6 w-6 ring-2 ring-background shadow-sm">
                                                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-xs font-bold">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
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
                                                <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" /> Command Center
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-lg hover:bg-primary/10 cursor-pointer">
                                            <Link to="/billing" className="w-full flex items-center">
                                                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" /> Billing
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-border/50 mx-2" />
                                        <DropdownMenuItem onClick={logout} className="rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer font-medium">
                                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="font-semibold px-5">
                                    <Link to="/login">Sign In</Link>
                                </Button>
                                <Button asChild className="font-semibold px-6 shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)]">
                                    <Link to="/register">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-3 relative z-10">
                        {isAuthenticated && (
                            <Link to="/dashboard" className="mr-1">
                                <Avatar className="h-8 w-8 ring-1 ring-border shadow-sm">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        )}
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="h-10 w-10 border-border/50 bg-background/50 ring-1 ring-border/50 shadow-inner">
                                    <Menu className="h-5 w-5 text-foreground" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80 p-0 border-l border-border/40 bg-card/95 backdrop-blur-3xl shadow-2xl flex flex-col">
                                <div className="h-20 flex items-center px-6 border-b border-border/40">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center ring-1 ring-primary/30">
                                            <Zap className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="font-extrabold text-xl tracking-tight">TrueValidator</span>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                    <nav className="flex flex-col gap-4">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                to={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`text-lg font-semibold tracking-wide ${location.pathname === link.href ? 'text-primary' : 'text-foreground'}`}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="pt-6 border-t border-border/40">
                                        {isAuthenticated ? (
                                            <div className="space-y-4">
                                                <Button asChild className="w-full justify-start h-12">
                                                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                                        <LayoutDashboard className="h-5 w-5 mr-3" /> Command Center
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full justify-start h-12 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-500">
                                                    <LogOut className="h-5 w-5 mr-3" /> Sign Out
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Button asChild variant="outline" className="w-full h-12">
                                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                                                </Button>
                                                <Button asChild className="w-full h-12">
                                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full relative z-10 pt-20">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-card/30 backdrop-blur-xl relative z-10 py-16 xl:py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 lg:gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center ring-1 ring-primary/30 shadow-inner">
                                <Zap className="h-5 w-5 text-primary drop-shadow-sm" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">True<span className="text-primary">Validator</span></span>
                        </Link>
                        <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed">
                            Enterprise-grade telemetry and validation infrastructure powering next-generation validation pipelines.
                        </p>
                    </div>
                    <div className="col-span-1">
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-foreground drop-shadow-sm">Infrastructure</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Allocation & Pricing</Link></li>
                            <li><Link to="/docs" className="hover:text-primary transition-colors">Developer Vault</Link></li>
                            <li><Link to="/docs" className="hover:text-primary transition-colors">System Protocol</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-foreground drop-shadow-sm">Contact Us</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                            {settings?.contactInfo?.email && (
                                <li><a href={`mailto:${settings.contactInfo.email}`} className="flex items-center gap-2 hover:text-primary transition-colors"><Mail className="h-4 w-4" /> Email</a></li>
                            )}
                            {settings?.contactInfo?.supportEmail && (
                                <li><a href={`mailto:${settings.contactInfo.supportEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors"><Mail className="h-4 w-4" /> Support</a></li>
                            )}
                            {settings?.contactInfo?.phone && (
                                <li><span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.contactInfo.phone}</span></li>
                            )}
                            {!settings?.contactInfo?.email && !settings?.contactInfo?.phone && (
                                <>
                                    <li><Link to="/about" className="hover:text-primary transition-colors">Intel</Link></li>
                                    <li><Link to="/blog" className="hover:text-primary transition-colors">Transmission Log</Link></li>
                                    <li><Link to="/contact" className="hover:text-primary transition-colors">Support Channels</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-foreground drop-shadow-sm">Compliance</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Protocol</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link></li>
                            <li><Link to="/gdpr" className="hover:text-primary transition-colors">GDPR Compliancy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 border-t border-border/40 mt-16 pt-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">
                        © {new Date().getFullYear()} TrueValidator Compute Network
                    </p>
                    <div className="flex gap-4">
                        {settings?.socialMedia?.twitter && (
                            <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
                        )}
                        {settings?.socialMedia?.facebook && (
                            <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></a>
                        )}
                        {settings?.socialMedia?.linkedin && (
                            <a href={settings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
                        )}
                        {settings?.socialMedia?.instagram && (
                            <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
                        )}
                        {settings?.socialMedia?.github && (
                            <a href={settings.socialMedia.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
