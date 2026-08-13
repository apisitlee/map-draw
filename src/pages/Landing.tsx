import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f2f7] text-[#1c1c1e] font-sans">
            <h1 className="text-5xl font-bold mb-6">欢迎来到 Map 平台</h1>
            <p className="text-lg mb-8 text-[#3c3c43]">无需登录即可浏览的公共主页介绍信息。</p>
            <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#0056b3] transition-colors"
            >
                去登录 / 注册
            </button>
        </div>
    );
};