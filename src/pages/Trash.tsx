import React from 'react';

export const Trash: React.FC = () => {
    return (
        <div className="min-h-full bg-[#f2f2f7] text-[#1c1c1e] p-6 md:p-12 font-sans">
            <h1 className="text-3xl font-bold mb-4">回收站</h1>
            <p className="text-[#3c3c43]">这里是您的回收站内容。</p>
        </div>
    );
};