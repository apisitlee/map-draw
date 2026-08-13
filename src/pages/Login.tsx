import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        // 模拟登录逻辑：在实际应用中，这里会调用 API 并将 Token 存入 localStorage
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/files/home');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-main)] font-sans">
            <div className="bg-[var(--bg-panel)] p-8 rounded-2xl shadow-2xl border border-[var(--border-line)] w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">登录账号</h2>
                {/* 这里可以添加表单输入框 */}
                <button
                    onClick={handleLogin}
                    className="w-full px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg font-medium hover:bg-[var(--theme-primary-hover)] transition-colors"
                >
                    模拟登录
                </button>
            </div>
        </div>
    );
};