import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { casinoSounds } from '../lib/casinoSounds';
import { create } from 'zustand';

// Store for coin animations
interface CoinAnimationState {
    amount: number;
    isVisible: boolean;
    triggerAnimation: (amount: number) => void;
    hideAnimation: () => void;
}

export const useCoinAnimationStore = create<CoinAnimationState>((set) => ({
    amount: 0,
    isVisible: false,
    triggerAnimation: (amount: number) => {
        set({ amount, isVisible: true });
        // Auto-hide after animation
        setTimeout(() => {
            set({ isVisible: false });
        }, 2500);
    },
    hideAnimation: () => set({ isVisible: false }),
}));

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (end <= 0) return;

        setIsAnimating(true);
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out-expo)
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(startValue + (end - startValue) * eased);

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);

        return () => setIsAnimating(false);
    }, [end, duration]);

    return { count, isAnimating };
};

// Main component
export const CoinRewardAnimation: React.FC = () => {
    const { amount, isVisible } = useCoinAnimationStore();
    const { count } = useAnimatedCounter(isVisible ? amount : 0, 1800);
    const [hasPlayedSound, setHasPlayedSound] = useState(false);

    // Play coin sound when animation starts
    useEffect(() => {
        if (isVisible && amount > 0 && !hasPlayedSound) {
            casinoSounds.coins();
            setHasPlayedSound(true);
        }
        if (!isVisible) {
            setHasPlayedSound(false);
        }
    }, [isVisible, amount, hasPlayedSound]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -30 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(234, 179, 8, 0.3)',
                                '0 0 60px rgba(234, 179, 8, 0.6)',
                                '0 0 20px rgba(234, 179, 8, 0.3)'
                            ]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-2xl p-6 shadow-2xl border-2 border-yellow-400"
                    >
                        {/* Coin icon with animation */}
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                rotateY: { repeat: Infinity, duration: 0.8, ease: 'linear' },
                                scale: { repeat: Infinity, duration: 0.5 }
                            }}
                            className="flex items-center justify-center mb-3"
                        >
                            <div className="bg-yellow-400 p-4 rounded-full shadow-lg">
                                <Coins className="w-10 h-10 text-yellow-900" />
                            </div>
                        </motion.div>

                        {/* Animated counter */}
                        <div className="text-center">
                            <motion.div
                                key={count}
                                initial={{ scale: 1.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-white drop-shadow-lg"
                            >
                                +{count}
                            </motion.div>
                            <div className="text-yellow-100 text-sm font-bold mt-1 tracking-wide">
                                MediCoins
                            </div>
                        </div>

                        {/* Sparkle particles */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                    x: 0,
                                    y: 0
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    x: Math.cos(i * Math.PI / 4) * 80,
                                    y: Math.sin(i * Math.PI / 4) * 80
                                }}
                                transition={{
                                    delay: i * 0.1,
                                    duration: 0.8,
                                    repeat: Infinity,
                                    repeatDelay: 0.5
                                }}
                                className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-300 rounded-full"
                                style={{ marginLeft: -6, marginTop: -6 }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Helper function to trigger coin animation
export const triggerCoinReward = (amount: number) => {
    useCoinAnimationStore.getState().triggerAnimation(amount);
};
