import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, HelpCircle, ArrowLeft,
    LogOut, Settings, Menu, X, Stethoscope, AlertTriangle, MessageCircle, Activity, Search
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import clsx from 'clsx';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Casos Clínicos', path: '/admin/cases' },
    { icon: HelpCircle, label: 'Quizzes', path: '/admin/quizzes' },
    { icon: Stethoscope, label: 'Plantões', path: '/admin/shifts' },
    { icon: AlertTriangle, label: 'Plantão ∞', path: '/admin/plantao' },
    { icon: MessageCircle, label: 'Consulta Express', path: '/admin/osce' },
    { icon: Activity, label: 'ECG Game', path: '/admin/ecg' },
    { icon: Search, label: 'Medical Detective', path: '/admin/detective' },
];


export const AdminLayout: React.FC = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { isAdmin, setAdmin, customCases, customQuizzes } = useAdminStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password check (in production, use proper auth)
        if (password === 'admin123') {
            setAdmin(true);
            setError('');
        } else {
            setError('Senha incorreta');
        }
    };

    const handleLogout = () => {
        setAdmin(false);
        navigate('/');
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center p-4">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/50">
                            <Settings className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Painel Admin</h1>
                        <p className="text-slate-400 text-sm">Digite a senha para acessar</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha de administrador"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                            Entrar
                        </button>
                    </form>

                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 mt-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao jogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:relative z-50 h-full w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/50">
                            <Settings className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <div className="font-bold text-white">MedGame Admin</div>
                            <div className="text-[10px] text-slate-400">Painel de Controle</div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-slate-700">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-cyan-400">{customCases.length}</div>
                            <div className="text-[10px] text-slate-400">Casos</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-emerald-400">{customQuizzes.length}</div>
                            <div className="text-[10px] text-slate-400">Quizzes</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                    isActive
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao jogo
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6 shrink-0">
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <h1 className="text-lg font-bold text-white">
                        {navItems.find(i => i.path === pathname)?.label || 'Admin'}
                    </h1>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400 hidden sm:block">Administrador</span>
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-sm font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
