import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';

export const Login: React.FC = () => {
    const { showToast } = useDialog();
    const navigate = useNavigate();

    // 表单数据与状态管理
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async () => {
        // 清理之前的提示信息
        setError('');
        setSuccessMsg('');

        if (!username || !password) {
            setError('用户名和密码不能为空');
            return;
        }

        try {
            if (isLoginMode) {
                // 1. 执行登录逻辑
                const response = await api.login({ username, password });
                localStorage.setItem('token', response.token);
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/files/home');
            } else {
                // 2. 执行注册逻辑
                await api.register({ username, password });
                setSuccessMsg('注册成功！请登录。');
                setIsLoginMode(true); // 注册成功后自动切换回登录模式
                // 可选：清空密码框让用户重新输入确认，或者保留密码直接让用户点登录
                // setPassword(''); 
            }
        } catch (err: any) {
            setError(err.message || (isLoginMode ? '登录失败，请检查用户名和密码' : '注册失败，用户名可能已存在'));
            showToast(err?.message || '登录失败', 'error');
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccessMsg('');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-main)] font-sans">
            <div className="bg-[var(--bg-panel)] p-8 rounded-lg shadow-xl border border-[var(--border-line)] w-96 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLoginMode ? '系统登录' : '创建新账号'}
                </h2>

                {/* 错误提示 */}
                {error && <div className="mb-4 text-red-500 text-sm text-center font-medium">{error}</div>}
                {/* 成功提示 */}
                {successMsg && <div className="mb-4 text-emerald-500 text-sm text-center font-medium">{successMsg}</div>}

                <div className="flex flex-col gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-line)] rounded-md outline-none focus:border-[var(--theme-primary)] transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-line)] rounded-md outline-none focus:border-[var(--theme-primary)] transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-2.5 bg-[var(--theme-primary)] text-white rounded-md font-medium hover:bg-[var(--theme-primary-hover)] active:scale-[0.98] transition-all shadow-md"
                >
                    {isLoginMode ? '登 录' : '注 册'}
                </button>

                {/* 模式切换按钮 */}
                <div className="mt-6 text-center text-sm">
                    <span className="text-[var(--text-sub)]">
                        {isLoginMode ? '还没有账号？ ' : '已有账号？ '}
                    </span>
                    <button
                        onClick={toggleMode}
                        className="font-semibold text-[#5856D6] hover:text-[#413f9c] transition-colors"
                    >
                        {isLoginMode ? '点击注册' : '返回登录'}
                    </button>
                </div>
            </div>
        </div>
    );
};