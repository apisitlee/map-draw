import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, HelpCircle, CheckCircle, X } from 'lucide-react';

interface DialogState {
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    defaultValue?: string;
    onConfirm?: (val?: string) => void;
    onCancel?: () => void;
}

interface DialogContextType {
    showAlert: (message: string, title?: string) => void;
    showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
    showPrompt: (message: string, defaultValue: string, onConfirm: (val?: string) => void, title?: string) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('useDialog must be used within DialogProvider');
    return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: 'alert', title: '', message: '' });
    const [promptValue, setPromptValue] = useState('');

    const close = () => setDialog((prev) => ({ ...prev, isOpen: false }));

    const showAlert = (message: string, title = '提示') => {
        setDialog({ isOpen: true, type: 'alert', title, message });
    };

    const showConfirm = (message: string, onConfirm: () => void, title = '确认操作') => {
        setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm, onCancel: close });
    };

    const showPrompt = (message: string, defaultValue: string, onConfirm: (val?: string) => void, title = '输入信息') => {
        setPromptValue(defaultValue);
        setDialog({ isOpen: true, type: 'prompt', title, message, defaultValue, onConfirm, onCancel: close });
    };

    const handleConfirm = () => {
        if (dialog.onConfirm) {
            dialog.type === 'prompt' ? dialog.onConfirm(promptValue) : dialog.onConfirm();
        }
        close();
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
            {children}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="w-[320px] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#1c1c1e] flex items-center gap-1.5">
                                {dialog.type === 'alert' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                {dialog.type === 'confirm' && <HelpCircle className="w-4 h-4 text-[#007AFF]" />}
                                {dialog.type === 'prompt' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                {dialog.title}
                            </span>
                            <button onClick={close} className="w-6 h-6 rounded-full text-[#8e8e93] hover:bg-black/5 flex items-center justify-center transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="text-xs text-[#3c3c43] leading-relaxed">{dialog.message}</div>
                        {dialog.type === 'prompt' && (
                            <input
                                type="text"
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-lg border border-[#d1d1d6] text-xs outline-none focus:border-[#007AFF] transition-colors mt-2"
                                autoFocus
                            />
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                            {dialog.type !== 'alert' && (
                                <button onClick={dialog.onCancel || close} className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#3c3c43] bg-black/5 hover:bg-black/10 transition-colors">
                                    取消
                                </button>
                            )}
                            <button onClick={handleConfirm} className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0056b3] transition-colors">
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};