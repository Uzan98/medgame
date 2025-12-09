import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import { HomePage } from './pages/HomePage'
import { CaseCatalog } from './pages/CaseCatalog'
import { Profile } from './pages/Profile'
import { GameInterface } from './pages/GameInterface'
import { QuizPage } from './pages/QuizPage'
import { ShopPage } from './pages/ShopPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { StudyPage } from './pages/StudyPage'
import { MessagesPage } from './pages/MessagesPage'
import { CareerTreePage } from './pages/CareerTreePage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminCasesList } from './pages/admin/AdminCasesList'
import { AdminCaseEditor } from './pages/admin/AdminCaseEditor'
import { AdminQuizzesList } from './pages/admin/AdminQuizzesList'
import { AdminQuizEditor } from './pages/admin/AdminQuizEditor'
import { TutorialOverlay } from './components/TutorialOverlay'

import { useGameStore } from './store/gameStore';
import { useEffect, useState } from 'react';
import { ToastContainer } from './components/ToastContainer';

function App() {
    const { updateHunger, hasSeenTutorial } = useGameStore();
    const [showTutorial, setShowTutorial] = useState(false);

    // Global Hunger Timer
    useEffect(() => {
        // Check immediate update on load
        updateHunger();

        // Check every minute
        const interval = setInterval(() => {
            updateHunger();
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [updateHunger]);

    // Show tutorial on first visit
    useEffect(() => {
        if (!hasSeenTutorial) {
            // Small delay to let the UI render first
            const timer = setTimeout(() => setShowTutorial(true), 500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial]);

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        useGameStore.setState({ hasSeenTutorial: true });
    };

    // Export a way to trigger tutorial from anywhere
    (window as any).showTutorial = () => setShowTutorial(true);

    return (
        <Router>
            <ToastContainer />
            <TutorialOverlay isVisible={showTutorial} onClose={handleCloseTutorial} />
            <Routes>
                {/* Main App Routes */}
                <Route path="/" element={<Layout onShowTutorial={() => setShowTutorial(true)} />}>
                    <Route index element={<HomePage />} />
                    <Route path="cases" element={<CaseCatalog />} />
                    <Route path="game/:caseId" element={<GameInterface />} />
                    <Route path="quiz" element={<QuizPage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="study" element={<StudyPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="career" element={<CareerTreePage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="cases" element={<AdminCasesList />} />
                    <Route path="cases/new" element={<AdminCaseEditor />} />
                    <Route path="cases/edit/:id" element={<AdminCaseEditor />} />
                    <Route path="quizzes" element={<AdminQuizzesList />} />
                    <Route path="quizzes/new" element={<AdminQuizEditor />} />
                    <Route path="quizzes/edit/:id" element={<AdminQuizEditor />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App

