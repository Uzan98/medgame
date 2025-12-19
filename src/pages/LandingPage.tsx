import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    GraduationCap,
    Brain,
    Trophy,
    Users,
    Zap,
    ChevronRight,
    Star,
    BookOpen,
    Target,
    Play,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Heart,
    Stethoscope
} from 'lucide-react';
import clsx from 'clsx';

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count.toLocaleString()}{suffix}</span>;
};

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, color, delay }: {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative group"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </motion.div>
);

// Testimonial card
const TestimonialCard = ({ name, role, text, avatar, delay }: {
    name: string;
    role: string;
    text: string;
    avatar: string;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {avatar}
            </div>
            <div>
                <h4 className="font-bold text-white">{name}</h4>
                <p className="text-xs text-slate-400">{role}</p>
            </div>
        </div>
        <p className="text-slate-300 text-sm italic">"{text}"</p>
        <div className="flex gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
        </div>
    </motion.div>
);

export const LandingPage: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

    const features = [
        { icon: Brain, title: 'Casos Clínicos Reais', description: 'Pratique com casos baseados em situações reais do dia a dia médico.', color: 'bg-purple-500/20 text-purple-400' },
        { icon: Zap, title: 'Quizzes Diagnósticos', description: 'Teste suas habilidades diagnósticas com tempo limitado.', color: 'bg-yellow-500/20 text-yellow-400' },
        { icon: Trophy, title: 'Gamificação Completa', description: 'Ganhe XP, suba de nível e desbloqueie conquistas médicas.', color: 'bg-amber-500/20 text-amber-400' },
        { icon: BookOpen, title: 'Estudo Direcionado', description: 'Cronômetro de estudos e sistema de recompensas por hora estudada.', color: 'bg-emerald-500/20 text-emerald-400' },
        { icon: Users, title: 'Ranking Global', description: 'Compete com estudantes de medicina de todo o país.', color: 'bg-cyan-500/20 text-cyan-400' },
        { icon: Target, title: 'Árvore de Especialidades', description: 'Escolha sua carreira médica e evolua suas habilidades.', color: 'bg-rose-500/20 text-rose-400' },
    ];

    const testimonials = [
        { name: 'Lucas M.', role: 'Estudante de Medicina - 6º período', text: 'Finalmente um app que torna o estudo de medicina divertido! Os casos clínicos são muito bem elaborados.', avatar: 'LM' },
        { name: 'Ana Clara', role: 'Residente em Cardiologia', text: 'Uso todos os dias para revisar. O sistema de gamificação me mantém motivada mesmo depois de plantões longos.', avatar: 'AC' },
        { name: 'Pedro H.', role: 'Estudante de Medicina - 4º período', text: 'Os quizzes diagnósticos são viciantes! Minha capacidade de raciocínio clínico melhorou muito.', avatar: 'PH' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                MedGame
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/auth"
                                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
                            >
                                Entrar
                            </Link>
                            <Link
                                to="/auth"
                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                            >
                                Começar Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                style={{ y: heroY, opacity: heroOpacity }}
                className="relative min-h-screen flex items-center justify-center pt-16 px-4"
            >
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-[100px]" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M40%200v40H0%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

                <div className="relative max-w-5xl mx-auto text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Aprenda medicina de forma gamificada</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
                            Domine a Medicina
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Jogando
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                            A plataforma que transforma estudantes de medicina em profissionais confiantes.
                            Casos clínicos, quizzes e gamificação para turbinar seus estudos.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                to="/auth"
                                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all hover:scale-105"
                            >
                                <Play className="w-5 h-5" />
                                Começar Agora
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="flex items-center gap-2 px-8 py-4 border border-slate-600 rounded-xl text-slate-300 font-medium hover:border-slate-500 hover:text-white transition-all">
                                <BookOpen className="w-5 h-5" />
                                Ver Demonstração
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-black text-cyan-400">
                                    <AnimatedCounter end={1500} suffix="+" />
                                </div>
                                <p className="text-slate-500 text-sm">Estudantes Ativos</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                                    <AnimatedCounter end={200} suffix="+" />
                                </div>
                                <p className="text-slate-500 text-sm">Casos Clínicos</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-black text-yellow-400">
                                    <AnimatedCounter end={50} suffix="K+" />
                                </div>
                                <p className="text-slate-500 text-sm">Quizzes Respondidos</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-slate-500 rounded-full" />
                    </div>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Tudo que você precisa para
                            <span className="text-cyan-400"> dominar</span> medicina
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Uma experiência completa de aprendizado gamificado, projetada para maximizar sua retenção e motivação.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative py-20 px-4 bg-slate-900/50">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Como <span className="text-cyan-400">funciona</span>
                        </h2>
                        <p className="text-slate-400">Comece sua jornada em 3 passos simples</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0" />

                        {[
                            { step: 1, title: 'Crie sua conta', description: 'Cadastre-se gratuitamente e personalize seu avatar médico.', icon: GraduationCap },
                            { step: 2, title: 'Pratique diariamente', description: 'Resolva casos, complete quizzes e ganhe XP todos os dias.', icon: Target },
                            { step: 3, title: 'Evolua sua carreira', description: 'Suba de nível, desbloqueie especialidades e apareça no ranking.', icon: Trophy },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                className="text-center"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                            >
                                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse" />
                                    <div className="relative w-24 h-24 bg-slate-800 border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
                                        <item.icon className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            O que nossos <span className="text-cyan-400">estudantes</span> dizem
                        </h2>
                        <p className="text-slate-400">Milhares de futuros médicos já confiam no MedGame</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={t.name} {...t} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl" />
                        <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-3xl p-8 sm:p-12 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm mb-6">
                                <Heart className="w-4 h-4" />
                                <span>Gratuito para sempre</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                                Pronto para começar sua jornada?
                            </h2>
                            <p className="text-slate-400 max-w-xl mx-auto mb-8">
                                Junte-se a milhares de estudantes que estão transformando sua forma de estudar medicina.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/auth"
                                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all hover:scale-105"
                                >
                                    Criar Conta Grátis
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-400">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Sem cartão de crédito
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Acesso imediato
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Stethoscope className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg">MedGame</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            © 2024 MedGame. Transformando estudantes em médicos confiantes.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Termos</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacidade</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contato</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
