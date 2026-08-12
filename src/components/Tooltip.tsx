import React from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'bottom' }) => {
    // 根据传入的 placement 计算绝对定位的 CSS 类
    const placementStyles = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2 after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-6 after:border-transparent after:border-t-black/80',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2 after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-full after:border-6 after:border-transparent after:border-b-black/80',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2 after:absolute after:top-1/2 after:-translate-y-1/2 after:right-0 after:translate-x-full after:border-6 after:border-transparent after:border-l-black/80',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:-translate-x-full after:border-6 after:border-transparent after:border-r-black/80',
    };

    return (
        <div className="group relative inline-flex items-center justify-center">
            {children}
            <div
                className={`absolute z-[9999] hidden group-hover:block px-2.5 py-1.5 text-[11px] font-medium text-white bg-black/80 backdrop-blur-sm rounded-md drop-shadow-lg whitespace-nowrap pointer-events-none transition-opacity ${placementStyles[placement]}`}
            >
                {content}
            </div>
        </div>
    );
};