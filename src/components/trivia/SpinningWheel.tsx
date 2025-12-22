import React from 'react';
import { motion } from 'framer-motion';
import {
    Stethoscope,
    Scissors,
    Baby,
    Heart,
    Brain,
    Users
} from 'lucide-react';
import { TRIVIA_CATEGORIES, TriviaCategory } from '../../lib/triviaTypes';
import clsx from 'clsx';

interface SpinningWheelProps {
    onSpinEnd: (category: TriviaCategory) => void;
    isSpinning: boolean;
    onSpin: () => void;
    crowns: Record<string, boolean>;
    progress: Record<string, number>;
}

// Map icon names to components
const iconMap: Record<string, React.FC<{ className?: string }>> = {
    Stethoscope,
    Scissors,
    Baby,
    Heart,
    Brain,
    Users
};

// Colors from the reference image (Candy/Casino style)
const segmentColors = [
    '#d946ef', // Fuchsia/Pink
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ec4899', // Pink
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
    onSpinEnd,
    isSpinning,
    onSpin,
    crowns,
    progress
}) => {
    const [rotation, setRotation] = React.useState(0);

    // Calculate light positions (static)
    const lights = React.useMemo(() => Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const r = 148; // Radius for lights
        return {
            x: 160 + r * Math.cos(angle),
            y: 160 + r * Math.sin(angle)
        };
    }), []);

    const handleSpin = () => {
        if (isSpinning) return;

        // 🎰 Play the spinning wheel MP3 sound (10 seconds)
        const spinAudio = new Audio('/spinning-wheel.mp3');
        spinAudio.play().catch(e => console.warn('Audio play failed:', e));

        // Calculate random rotation (more spins to match 10 second audio)
        const spins = 8 + Math.random() * 4; // 8-12 full spins
        const randomAngle = Math.random() * 360;
        const totalRotation = rotation + (spins * 360) + randomAngle;

        setRotation(totalRotation);

        // Calculate which category will be selected
        // The pointer is at the top (0°), so we need to find which segment is there
        const normalizedAngle = (360 - (totalRotation % 360)) % 360;
        const segmentSize = 360 / TRIVIA_CATEGORIES.length;
        const selectedIndex = Math.floor(normalizedAngle / segmentSize);
        const selected = TRIVIA_CATEGORIES[selectedIndex];

        // Call onSpin to update parent state
        onSpin();

        // Notify parent after animation completes (10 seconds to match audio)
        setTimeout(() => {
            onSpinEnd(selected);
        }, 10000);
    };

    // Create SVG path for a pie segment
    const createSegmentPath = (index: number, total: number): string => {
        const angle = 360 / total;
        const startAngle = index * angle - 90; // Start from top
        const endAngle = startAngle + angle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const radius = 150;
        const centerX = 160;
        const centerY = 160;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    // Calculate position for icon in segment
    const getIconPosition = (index: number, total: number) => {
        const angle = 360 / total;
        const midAngle = index * angle + angle / 2 - 90;
        const rad = (midAngle * Math.PI) / 180;
        const radius = 100;
        const centerX = 160;
        const centerY = 160;

        return {
            x: centerX + radius * Math.cos(rad),
            y: centerY + radius * Math.sin(rad)
        };
    };

    return (
        <div className="relative flex flex-col items-center max-w-[320px] mx-auto">
            {/* Pointer - Gold/Jewel style */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 -mt-2 filter drop-shadow-lg">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <path d="M 20 40 L 5 10 Q 20 0 35 10 Z" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="2" />
                    <circle cx="20" cy="15" r="5" fill="#a855f7" stroke="#7e22ce" strokeWidth="1" />
                </svg>
            </div>

            {/* Wheel Container */}
            <motion.div
                className="relative z-10"
                animate={{ rotate: rotation }}
                transition={{
                    type: "tween",
                    duration: 10,
                    ease: [0.2, 0.8, 0.2, 1]
                }}
            >
                <svg width="300" height="300" viewBox="0 0 320 320">
                    <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fcd34d" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        <linearGradient id="rimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4c1d95" />
                            <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <radialGradient id="centerGradient">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#be185d" />
                        </radialGradient>
                    </defs>

                    {/* Outer Rim - Deep 3D Purple */}
                    <circle cx="160" cy="160" r="156" fill="url(#rimGradient)" stroke="#312e81" strokeWidth="2" />

                    {/* Inner Gold Ring */}
                    <circle cx="160" cy="160" r="142" fill="none" stroke="url(#goldGradient)" strokeWidth="8" />

                    {/* Segments */}
                    <g transform="scale(0.88) translate(22, 22)">
                        {/* Scaled down to fit inside rim */}
                        {TRIVIA_CATEGORIES.map((category, index) => {
                            const pos = getIconPosition(index, TRIVIA_CATEGORIES.length);
                            const hasCrown = crowns[category.id];
                            const categoryProgress = progress[category.id] || 0;
                            const IconComponent = iconMap[category.icon];

                            return (
                                <g key={category.id}>
                                    <path
                                        d={createSegmentPath(index, TRIVIA_CATEGORIES.length)}
                                        fill={segmentColors[index]}
                                        stroke="#4c1d95"
                                        strokeWidth="4"
                                    />

                                    {/* Icon container */}
                                    <circle cx={pos.x} cy={pos.y} r="24" fill="rgba(0,0,0,0.15)" />

                                    {/* Icon or Crown */}
                                    <foreignObject x={pos.x - 12} y={pos.y - 12} width="24" height="24">
                                        <div className="flex items-center justify-center w-full h-full text-white/90">
                                            {hasCrown ? (
                                                <span className="text-xl">👑</span>
                                            ) : (
                                                <IconComponent className="w-5 h-5 drop-shadow-md" />
                                            )}
                                        </div>
                                    </foreignObject>

                                    {/* Progress dots (if no crown) */}
                                    {!hasCrown && (
                                        <g transform={`translate(${pos.x - 10}, ${pos.y + 18})`}>
                                            {[0, 1, 2].map((dotIndex) => (
                                                <circle
                                                    key={dotIndex}
                                                    cx={dotIndex * 10}
                                                    cy={0}
                                                    r="3"
                                                    fill={dotIndex < categoryProgress ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                                                />
                                            ))}
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Lights on Rim */}
                    {lights.map((light, i) => (
                        <circle
                            key={i}
                            cx={light.x}
                            cy={light.y}
                            r="4"
                            fill={i % 2 === 0 ? "#fef08a" : "#fbbf24"}
                            className="animate-pulse"
                            filter="drop-shadow(0 0 2px rgba(253, 224, 71, 0.8))"
                        />
                    ))}

                    {/* Center Decoration (Under button) */}
                    <circle cx="160" cy="160" r="45" fill="url(#rimGradient)" stroke="url(#goldGradient)" strokeWidth="4" />

                </svg>
            </motion.div>

            {/* Center SPIN Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <motion.button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                        "w-20 h-20 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-[0_0_15px_rgba(236,72,153,0.6)]",
                        isSpinning ? "cursor-not-allowed opacity-90" : "cursor-pointer"
                    )}
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, #ec4899, #be185d)'
                    }}
                >
                    <span className="text-yellow-100 font-black text-lg drop-shadow-md tracking-wider">
                        {isSpinning ? '...' : 'GIRAR'}
                    </span>
                </motion.button>
            </div>

            {/* Shadow under wheel */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/40 blur-xl rounded-full z-0" />
        </div>
    );
};
