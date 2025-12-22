import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
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
import { ShiftsPage } from './pages/ShiftsPage'
import { ShiftGamePage } from './pages/ShiftGamePage'
import { MedGamesPage } from './pages/MedGamesPage'
import { MedMilhaoPage } from './pages/MedMilhaoPage'
import { PlantaoInfinitoPage } from './pages/PlantaoInfinitoPage'
import { ConsultaExpressPage } from './pages/ConsultaExpressPage'
import { EcgGamePage } from './pages/EcgGamePage'
import { MedDetectivePage } from './pages/MedDetectivePage'
import { MedTriviaPage } from './pages/MedTriviaPage'
import { FriendsPage } from './pages/FriendsPage'
import { FriendProfilePage } from './pages/FriendProfilePage'
import { AuthPage } from './pages/AuthPage'
import { LandingPage } from './pages/LandingPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminCasesList } from './pages/admin/AdminCasesList'
import { AdminCaseEditor } from './pages/admin/AdminCaseEditor'
import { AdminQuizzesList } from './pages/admin/AdminQuizzesList'
import { AdminQuizEditor } from './pages/admin/AdminQuizEditor'
import { AdminShiftsList } from './pages/admin/AdminShiftsList'
import { AdminShiftEditor } from './pages/admin/AdminShiftEditor'
import { AdminPlantaoList } from './pages/admin/AdminPlantaoList'
import { AdminPlantaoCaseEditor } from './pages/admin/AdminPlantaoCaseEditor'
import { AdminPlantaoEventEditor } from './pages/admin/AdminPlantaoEventEditor'
import { AdminOsceCasesList } from './pages/admin/AdminOsceCasesList'
import { AdminOsceCaseEditor } from './pages/admin/AdminOsceCaseEditor'
import { AdminEcgCasesList } from './pages/admin/AdminEcgCasesList'
import { AdminEcgCaseEditor } from './pages/admin/AdminEcgCaseEditor'
import { AdminDetectiveCasesList } from './pages/admin/AdminDetectiveCasesList'
import { AdminDetectiveCaseEditor } from './pages/admin/AdminDetectiveCaseEditor'
import { AdminTriviaList } from './pages/admin/AdminTriviaList'
import { AdminTriviaEditor } from './pages/admin/AdminTriviaEditor'
import { TutorialOverlay } from './components/TutorialOverlay'
import { AuthProvider } from './contexts/AuthContext'

import { useGameStore } from './store/gameStore';
import { loadAdminContent } from './lib/adminSync';
import { useEffect, useState } from 'react';
import { ToastContainer } from './components/ToastContainer';
import { CoinRewardAnimation } from './components/CoinRewardAnimation';

function App() {
    const { updateHunger, hasSeenTutorial } = useGameStore();
    const [showTutorial, setShowTutorial] = useState(false);

    // Load admin content (cases/quizzes) from Supabase on start
    useEffect(() => {
        loadAdminContent();
    }, []);

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
        <AuthProvider>
            <Router>
                <ToastContainer />
                <CoinRewardAnimation />
                <TutorialOverlay isVisible={showTutorial} onClose={handleCloseTutorial} />
                <Routes>
                    {/* Public Landing Page */}
                    <Route path="/landing" element={<LandingPage />} />

                    {/* Auth Route */}
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Main App Routes - All protected */}
                    <Route path="/" element={<ProtectedRoute><Layout onShowTutorial={() => setShowTutorial(true)} /></ProtectedRoute>}>
                        <Route index element={<HomePage />} />
                        <Route path="cases" element={<CaseCatalog />} />
                        <Route path="game/:caseId" element={<GameInterface />} />
                        <Route path="quiz" element={<QuizPage />} />
                        <Route path="shop" element={<ShopPage />} />
                        <Route path="leaderboard" element={<LeaderboardPage />} />
                        <Route path="study" element={<StudyPage />} />
                        <Route path="career" element={<CareerTreePage />} />
                        <Route path="shifts" element={<ShiftsPage />} />
                        <Route path="shift/:shiftId" element={<ShiftGamePage />} />
                        <Route path="games" element={<MedGamesPage />} />
                        <Route path="games/medmilhao" element={<MedMilhaoPage />} />
                        <Route path="games/plantao-infinito" element={<PlantaoInfinitoPage />} />
                        <Route path="games/consulta-express" element={<ConsultaExpressPage />} />
                        <Route path="games/ecg" element={<EcgGamePage />} />
                        <Route path="games/detective" element={<MedDetectivePage />} />
                        <Route path="games/trivia" element={<MedTriviaPage />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="friends" element={<FriendsPage />} />
                        <Route path="friends/:friendId" element={<FriendProfilePage />} />
                        <Route path="messages" element={<MessagesPage />} />
                    </Route>

                    {/* Admin Routes - All protected */}
                    <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="cases" element={<AdminCasesList />} />
                        <Route path="cases/new" element={<AdminCaseEditor />} />
                        <Route path="cases/edit/:id" element={<AdminCaseEditor />} />
                        <Route path="quizzes" element={<AdminQuizzesList />} />
                        <Route path="quizzes/new" element={<AdminQuizEditor />} />
                        <Route path="quizzes/edit/:id" element={<AdminQuizEditor />} />
                        <Route path="shifts" element={<AdminShiftsList />} />
                        <Route path="shifts/new" element={<AdminShiftEditor />} />
                        <Route path="shifts/edit/:id" element={<AdminShiftEditor />} />
                        <Route path="plantao" element={<AdminPlantaoList />} />
                        <Route path="plantao/case/new" element={<AdminPlantaoCaseEditor />} />
                        <Route path="plantao/case/:id" element={<AdminPlantaoCaseEditor />} />
                        <Route path="plantao/event/new" element={<AdminPlantaoEventEditor />} />
                        <Route path="plantao/event/:id" element={<AdminPlantaoEventEditor />} />
                        <Route path="osce" element={<AdminOsceCasesList />} />
                        <Route path="osce/new" element={<AdminOsceCaseEditor />} />
                        <Route path="osce/edit/:id" element={<AdminOsceCaseEditor />} />
                        <Route path="ecg" element={<AdminEcgCasesList />} />
                        <Route path="ecg/new" element={<AdminEcgCaseEditor />} />
                        <Route path="ecg/:id" element={<AdminEcgCaseEditor />} />
                        <Route path="detective" element={<AdminDetectiveCasesList />} />
                        <Route path="detective/new" element={<AdminDetectiveCaseEditor />} />
                        <Route path="detective/:id" element={<AdminDetectiveCaseEditor />} />
                        <Route path="trivia" element={<AdminTriviaList />} />
                        <Route path="trivia/new" element={<AdminTriviaEditor />} />
                        <Route path="trivia/edit/:id" element={<AdminTriviaEditor />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
