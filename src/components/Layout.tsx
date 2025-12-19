import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Trophy, Mail, Plus, Menu, X, GraduationCap, HelpCircle, BookOpen, LogIn, Cloud, Stethoscope, Gamepad2 } from 'lucide-react';
import clsx from 'clsx';
import { useGameStore } from '../store/gameStore';
import { useMessageStore } from '../store/messageStore';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface LayoutProps {
    onShowTutorial?: () => void;
}

export const Layout = ({ onShowTutorial }: LayoutProps) => {
    const { pathname } = useLocation();
    const { coins, xp, level } = useGameStore();
    const { messages } = useMessageStore();
    const { user, syncing } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Ensure messages exists before filtering (safe access)
    const unreadCount = messages ? messages.filter(m => !m.read).length : 0;

    // Get display name from user metadata
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Dr. Usuário';

    const navItems = [
        { icon: Home, label: 'Início', path: '/', tutorialId: 'nav-home' },
        { icon: Gamepad2, label: 'Games', path: '/games', tutorialId: 'nav-games' },
        { icon: GraduationCap, label: 'Carreira', path: '/career', tutorialId: 'nav-career' },
        { icon: ShoppingCart, label: 'Loja', path: '/shop', tutorialId: 'nav-shop' },
        { icon: Trophy, label: 'Ranking', path: '/leaderboard', tutorialId: 'nav-ranking' },
        { icon: BookOpen, label: 'Estudo', path: '/study', tutorialId: 'nav-study' },
    ];

    const xpInCurrentLevel = xp % 1000;
    const xpProgress = (xpInCurrentLevel / 1000) * 100;

    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzNCwyMTEsMjM4LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

            {/* Mobile Menu Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:relative z-50 h-full flex flex-col items-center py-4 lg:py-6 border-r border-cyan-500/20 bg-slate-900/95 lg:bg-slate-900/50 backdrop-blur-md transition-all duration-300",
                "w-20 lg:w-24",
                sidebarOpen ? "left-0" : "-left-20 lg:left-0"
            )}>
                {/* Logo */}
                <div className="mb-6 lg:mb-8">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/50 text-cyan-400">
                        <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 flex flex-col w-full space-y-3 lg:space-y-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                data-tutorial={item.tutorialId}
                                className={clsx(
                                    "flex flex-col items-center justify-center py-2 relative transition-all duration-300 group",
                                    isActive ? "text-cyan-400" : "text-slate-400 hover:text-cyan-200"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                                )}
                                <Icon className={clsx(
                                    "w-5 h-5 lg:w-6 lg:h-6 mb-1 transition-transform group-hover:scale-110",
                                    isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                )} />
                                {item.path === '/messages' && unreadCount > 0 && (
                                    <div className="absolute top-1 right-1 lg:top-2 lg:right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] lg:text-[10px] font-bold text-white shadow shadow-red-500/50 animate-pulse">
                                        {unreadCount}
                                    </div>
                                )}
                                <span className="text-[8px] lg:text-[10px] uppercase font-medium tracking-wider">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col z-10 overflow-hidden w-full">
                {/* Top Header */}
                <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 border-b border-cyan-500/20 bg-slate-900/30 shrink-0" data-tutorial="stats">
                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Level Progress */}
                    <div className="hidden sm:flex items-center space-x-3 lg:space-x-4 flex-1 max-w-xs lg:max-w-sm">
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-cyan-500/30 shadow-[0_0_10px_rgba(8,145,178,0.2)] shrink-0">
                            <span className="text-base lg:text-xl font-bold text-white">{level}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-[10px] lg:text-xs text-cyan-100 mb-1">
                                <span className="font-bold">Nível {level}</span>
                                <span className="hidden md:inline">{xpInCurrentLevel}/1000 XP</span>
                            </div>
                            <div className="h-1.5 lg:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all" style={{ width: `${xpProgress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Currency */}
                    <Link to="/shop" className="flex items-center space-x-2 bg-slate-800/50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] lg:text-xs font-bold text-slate-900 border border-yellow-300">M</div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[8px] lg:text-[10px] text-yellow-200 uppercase hidden sm:block">MediMoedas</span>
                            <span className="text-sm lg:text-base font-bold text-yellow-400">{coins}</span>
                        </div>
                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 text-xs lg:text-sm">+</div>
                    </Link>

                    {/* Plantão Button */}
                    <Link
                        to="/shifts"
                        className={clsx(
                            "flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border transition-colors",
                            pathname === '/shifts' || pathname.startsWith('/shift/')
                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400"
                        )}
                        data-tutorial="nav-shifts"
                    >
                        <Stethoscope className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-xs lg:text-sm font-medium hidden sm:inline">Plantão</span>
                    </Link>

                    {/* Messages */}
                    <Link
                        to="/messages"
                        className="relative w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50"
                        data-tutorial="nav-messages"
                    >
                        <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow shadow-red-500/50 animate-pulse">
                                {unreadCount}
                            </div>
                        )}
                    </Link>

                    {/* Help Button */}
                    {onShowTutorial && (
                        <button
                            onClick={onShowTutorial}
                            className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50"
                            title="Ver tutorial"
                        >
                            <HelpCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                    )}

                    {/* Sync Indicator */}
                    {user && (
                        <div className={clsx(
                            "w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg transition-colors",
                            syncing ? "text-cyan-400 animate-pulse" : "text-emerald-400"
                        )} title={syncing ? "Sincronizando..." : "Dados sincronizados"}>
                            {syncing ? <Cloud className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                        </div>
                    )}

                    {/* User Profile / Login */}
                    {user ? (
                        <Link to="/profile" className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity" data-tutorial="avatar">
                            <div className="text-right hidden md:block">
                                <div className="text-xs lg:text-sm font-bold text-white">{displayName}</div>
                                <div className="text-[10px] lg:text-xs text-slate-400">Logado</div>
                            </div>
                            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-slate-700 rounded-full overflow-hidden border-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </Link>
                    ) : (
                        <Link
                            to="/auth"
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm font-medium">Entrar</span>
                        </Link>
                    )}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
