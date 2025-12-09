import { useToastStore } from '../store/toastStore';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className={clsx(
                            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px]",
                            toast.type === 'success' && "bg-emerald-500/20 border-emerald-500/30 text-emerald-100",
                            toast.type === 'error' && "bg-red-500/20 border-red-500/30 text-red-100",
                            toast.type === 'warning' && "bg-yellow-500/20 border-yellow-500/30 text-yellow-100",
                            toast.type === 'info' && "bg-cyan-500/20 border-cyan-500/30 text-cyan-100"
                        )}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}

                        <div className="flex-1 text-sm font-medium">{toast.message}</div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="hover:bg-white/10 rounded-full p-1 transition-colors"
                        >
                            <X className="w-4 h-4 opacity-70" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
