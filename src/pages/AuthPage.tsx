import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';

type Mode = 'login' | 'register';

export const AuthPage = () => {
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/');
            } else {
                if (password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres');
                }
                const { error } = await signUp(email, password, displayName);
                if (error) throw error;
                // Show success message for registration
                setError('Conta criada! Verifique seu email para confirmar.');
                setMode('login');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSg2LDE4MiwyMTIsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-[0_0_30px_rgba(34,211,238,0.5)] mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white">MedGame</h1>
                    <p className="text-slate-400 mt-1">Aprenda medicina jogando</p>
                </div>

                {/* Auth Card */}
                <div className="bg-slate-800/80 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex mb-6 bg-slate-900/50 rounded-xl p-1">
                        <button
                            onClick={() => setMode('login')}
                            className={clsx(
                                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                                mode === 'login'
                                    ? 'bg-cyan-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                            )}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={clsx(
                                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                                mode === 'register'
                                    ? 'bg-cyan-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                            )}
                        >
                            Criar Conta
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={clsx(
                            "flex items-center gap-2 p-3 rounded-lg text-sm mb-4",
                            error.includes('Conta criada')
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                        )}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Nome de exibição</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Dr. João"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : mode === 'login' ? (
                                'Entrar'
                            ) : (
                                'Criar Conta'
                            )}
                        </button>
                    </form>

                    {/* Guest mode */}
                    <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                        <Link
                            to="/"
                            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            Continuar sem conta →
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    Seus dados são salvos localmente até criar uma conta
                </p>
            </div>
        </div>
    );
};
