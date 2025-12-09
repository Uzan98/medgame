import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface TutorialStep {
    target: string; // CSS selector for the element to highlight
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tutorialSteps: TutorialStep[] = [
    {
        target: 'body',
        title: 'Bem-vindo ao MedGame! 🎮',
        description: 'Este é o seu simulador de carreira médica. Vamos fazer um tour rápido pelas funcionalidades principais!',
        position: 'center'
    },
    {
        target: '[data-tutorial="avatar"]',
        title: 'Seu Avatar 👨‍⚕️',
        description: 'Este é você! Acompanhe sua energia, fome e reputação. Cuide bem do seu personagem para jogar melhor.',
        position: 'bottom'
    },
    {
        target: '[data-tutorial="stats"]',
        title: 'Recursos e Nível 📊',
        description: 'Aqui você vê suas moedas, XP e nível atual. Complete casos e quizzes para ganhar mais!',
        position: 'bottom'
    },
    {
        target: '[data-tutorial="nav-cases"]',
        title: 'Casos Clínicos 🏥',
        description: 'Resolva casos clínicos interativos. Cada caso testa seu conhecimento médico e dá recompensas.',
        position: 'right'
    },
    {
        target: '[data-tutorial="nav-quiz"]',
        title: 'Quiz Rápido ⚡',
        description: 'Teste seus conhecimentos em quizzes cronometrados. Aposte moedas para ganhar mais!',
        position: 'right'
    },
    {
        target: '[data-tutorial="nav-career"]',
        title: 'Árvore de Carreira 🌳',
        description: 'Desbloqueie especialidades médicas conforme sobe de nível. Escolha seu caminho!',
        position: 'right'
    },
    {
        target: '[data-tutorial="nav-shop"]',
        title: 'Loja 🛒',
        description: 'Compre power-ups, itens cosméticos e pacotes de conteúdo com suas moedas.',
        position: 'right'
    },
    {
        target: '[data-tutorial="nav-study"]',
        title: 'Modo Estudo 📚',
        description: 'Estude para ganhar moedas e XP passivamente. Ótimo para acumular recursos!',
        position: 'right'
    },
    {
        target: 'body',
        title: 'Pronto para começar! 🚀',
        description: 'Agora você conhece o básico. Explore, aprenda e divirta-se na sua jornada médica!',
        position: 'center'
    }
];

interface TutorialOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

export const TutorialOverlay = ({ isVisible, onClose }: TutorialOverlayProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const step = tutorialSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tutorialSteps.length - 1;

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            return;
        }

        const updateTargetRect = () => {
            if (step.target === 'body' || step.position === 'center') {
                setTargetRect(null);
                return;
            }

            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Scroll element into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setTargetRect(null);
            }
        };

        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        return () => window.removeEventListener('resize', updateTargetRect);
    }, [isVisible, currentStep, step]);

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    // Calculate tooltip position - clamped to viewport
    const getTooltipStyle = (): React.CSSProperties => {
        const padding = 16;
        const tooltipWidth = 320;
        const tooltipHeight = 220;
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 600;

        // Center position for intro/outro steps
        if (!targetRect || step.position === 'center') {
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        let top = 0;
        let left = 0;

        switch (step.position) {
            case 'top':
                top = targetRect.top - tooltipHeight - padding;
                left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = targetRect.bottom + padding;
                left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                left = targetRect.left - tooltipWidth - padding;
                break;
            case 'right':
                top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                left = targetRect.right + padding;
                break;
        }

        // Clamp to viewport bounds
        top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));
        left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));

        return {
            position: 'fixed',
            top,
            left
        };
    };

    // Don't render anything if not visible
    if (!isVisible) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
        >
            {/* Backdrop with cutout */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Highlighted element */}
            {targetRect && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute border-4 border-cyan-400 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] pointer-events-none"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                    }}
                />
            )}

            {/* Tooltip */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute w-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl p-5"
                style={getTooltipStyle()}
            >
                {/* Sparkle decoration */}
                <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-cyan-400 animate-pulse" />

                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Step indicator */}
                <div className="flex gap-1 mb-3">
                    {tutorialSteps.map((_, idx) => (
                        <div
                            key={idx}
                            className={clsx(
                                "h-1 rounded-full transition-all",
                                idx === currentStep
                                    ? "w-6 bg-cyan-400"
                                    : idx < currentStep
                                        ? "w-2 bg-cyan-600"
                                        : "w-2 bg-slate-600"
                            )}
                        />
                    ))}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{step.description}</p>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Pular tutorial
                    </button>

                    <div className="flex gap-2">
                        {!isFirstStep && (
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-600 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={16} />
                                Voltar
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                        >
                            {isLastStep ? 'Começar!' : 'Próximo'}
                            {!isLastStep && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

