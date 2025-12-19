import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useDetectiveStore } from '../../store/detectiveStore';
import clsx from 'clsx';

export const NarrativePlayer: React.FC = () => {
    const store = useDetectiveStore();
    const currentCase = store.currentCase;
    const scenes = currentCase?.narrativeScenes || [];
    const currentIndex = store.currentNarrativeIndex;
    const currentScene = scenes[currentIndex];

    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Typewriter effect
    useEffect(() => {
        if (!currentScene) return;

        setDisplayedText('');
        setIsTyping(true);
        let index = 0;
        const text = currentScene.text;

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, 30); // 30ms per character

        return () => clearInterval(typeInterval);
    }, [currentScene]);

    // Audio handling
    useEffect(() => {
        if (!currentScene?.audioUrl) return;

        // Stop previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Play new audio
        const audio = new Audio(currentScene.audioUrl);
        audio.muted = isMuted;
        audioRef.current = audio;
        audio.play().catch(() => {
            // Autoplay blocked, ignore
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [currentScene?.audioUrl, currentIndex]);

    // Update mute state
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Auto-advance if duration is set
    useEffect(() => {
        if (!currentScene?.duration || isTyping) return;

        const timer = setTimeout(() => {
            handleNext();
        }, currentScene.duration);

        return () => clearTimeout(timer);
    }, [currentScene?.duration, isTyping, currentIndex]);

    const handleNext = () => {
        if (isTyping) {
            // Skip typing animation
            setDisplayedText(currentScene?.text || '');
            setIsTyping(false);
            return;
        }

        setIsTransitioning(true);
        setTimeout(() => {
            store.nextNarrativeScene();
            setIsTransitioning(false);
        }, 300);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsTransitioning(true);
            setTimeout(() => {
                store.prevNarrativeScene();
                setIsTransitioning(false);
            }, 300);
        }
    };

    const handleSkip = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        store.skipNarrative();
    };

    if (!currentScene) return null;

    const textPositionClasses = {
        top: 'top-8 left-0 right-0',
        center: 'top-1/2 left-0 right-0 -translate-y-1/2',
        bottom: 'bottom-24 left-0 right-0'
    };

    const textStyleClasses = {
        normal: 'text-white text-lg md:text-xl',
        dramatic: 'text-red-400 text-xl md:text-2xl font-bold uppercase tracking-wide',
        whisper: 'text-slate-300 text-base md:text-lg italic'
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Background Image */}
            <div
                className={clsx(
                    'absolute inset-0 bg-cover bg-center transition-all duration-500',
                    isTransitioning && 'opacity-0 scale-105'
                )}
                style={{ backgroundImage: `url(${currentScene.imageUrl})` }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />
            </div>

            {/* Top Controls */}
            <div className="relative z-10 flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">
                        {currentIndex + 1} / {scenes.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleSkip}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                        <span className="text-sm">Pular</span>
                    </button>
                </div>
            </div>

            {/* Narrative Text */}
            <div
                className={clsx(
                    'absolute z-10 px-8 md:px-16',
                    textPositionClasses[currentScene.textPosition || 'bottom']
                )}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <p
                        className={clsx(
                            'leading-relaxed drop-shadow-lg',
                            textStyleClasses[currentScene.textStyle || 'normal']
                        )}
                    >
                        {displayedText}
                        {isTyping && <span className="animate-pulse ml-1">|</span>}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="relative z-10 mt-auto flex items-center justify-between p-4 md:p-8">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-3 rounded-xl transition-all',
                        currentIndex === 0
                            ? 'opacity-30 cursor-not-allowed'
                            : 'bg-slate-800/50 hover:bg-slate-700/50 text-white'
                    )}
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                    {scenes.map((_, idx) => (
                        <div
                            key={idx}
                            className={clsx(
                                'w-2 h-2 rounded-full transition-all',
                                idx === currentIndex
                                    ? 'bg-cyan-400 w-4'
                                    : idx < currentIndex
                                        ? 'bg-cyan-400/50'
                                        : 'bg-slate-600'
                            )}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
                >
                    <span>{isTyping ? 'Mostrar tudo' : 'Próximo'}</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
