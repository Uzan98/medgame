// Page wrappers for game-specific challenge pages
import React from 'react';
import { GameChallengesPage } from '../components/challenges/GameChallengesPage';

// Trivia Challenges Page
export const TriviaChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="trivia" />
);

// Detective Challenges Page
export const DetectiveChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="detective" />
);

// Milhao Challenges Page
export const MilhaoChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="milhao" />
);

// ECG Challenges Page
export const EcgChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="ecg" />
);

// Consulta Challenges Page
export const ConsultaChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="consulta" />
);

// Plantao Challenges Page
export const PlantaoChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="plantao" />
);

// Quiz Challenges Page
export const QuizChallengesPage: React.FC = () => (
    <GameChallengesPage gameType="quiz" />
);
