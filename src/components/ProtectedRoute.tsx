import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Carregando...</p>
                </div>
            </div>
        );
    }

    // Redirect to auth if not logged in
    if (!user) {
        // Save the attempted URL to redirect back after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
