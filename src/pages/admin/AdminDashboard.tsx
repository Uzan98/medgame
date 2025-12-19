import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, HelpCircle, Plus, TrendingUp, Users, Clock } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { sampleCases } from '../../lib/cases';
import { quizCases } from '../../lib/quizCases';

export const AdminDashboard: React.FC = () => {
    const { customCases, customQuizzes } = useAdminStore();

    const totalCases = sampleCases.length + customCases.length;
    const totalQuizzes = quizCases.length + customQuizzes.length;

    const stats = [
        { icon: FileText, label: 'Total de Casos', value: totalCases, color: 'cyan', subtext: `${customCases.length} personalizados` },
        { icon: HelpCircle, label: 'Total de Quizzes', value: totalQuizzes, color: 'emerald', subtext: `${customQuizzes.length} personalizados` },
        { icon: Users, label: 'Jogadores Ativos', value: '1.2k', color: 'purple', subtext: 'Últimos 7 dias' },
        { icon: TrendingUp, label: 'Partidas Hoje', value: '3.4k', color: 'yellow', subtext: '+12% vs ontem' },
    ];

    const recentActivity = [
        { action: 'Caso criado', item: 'Dor Torácica Aguda', time: '2h atrás' },
        { action: 'Quiz editado', item: 'Fibrilação Atrial', time: '5h atrás' },
        { action: 'Caso deletado', item: 'Teste Antigo', time: '1d atrás' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao Painel Admin! 👋</h2>
                <p className="text-slate-400 text-sm">Gerencie os casos clínicos e quizzes do MedGame.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-slate-400">{stat.label}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{stat.subtext}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/admin/cases/new"
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                            <Plus className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Criar Caso Clínico</h3>
                            <p className="text-sm text-slate-400">Adicione um novo caso com questões</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/admin/quizzes/new"
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                            <Plus className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Criar Quiz</h3>
                            <p className="text-sm text-slate-400">Adicione um quiz de diagnóstico rápido</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    Atividade Recente
                </h3>
                <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                            <div>
                                <span className="text-slate-400 text-sm">{activity.action}: </span>
                                <span className="text-white text-sm font-medium">{activity.item}</span>
                            </div>
                            <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
