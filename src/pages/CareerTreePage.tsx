import { CareerRoadmap } from '../components/career/CareerRoadmap';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CareerTreePage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Carreira Médica
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Evolua e desbloqueie especializações
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white font-medium">Sua Jornada</span>
                    </div>
                </div>

                {/* Quick Guide */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm">
                    <div className="flex flex-wrap gap-4 text-slate-300">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span>Nível 1: Acadêmico</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span>Nível 3: Residência</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>Nível 8: Especialidades</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Nível 15: Subespecialidades</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Career Roadmap */}
            <CareerRoadmap />
        </div>
    );
};
