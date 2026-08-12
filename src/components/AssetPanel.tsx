import React from 'react';
import { useMap } from '../context/MapContext';

export const AssetPanel: React.FC = () => {
    const {
        openedLeftPanel,
    } = useMap();

    return (
        openedLeftPanel === 'asset' && (
            <div className="absolute top-0 left-[55px] w-[290px] h-[100vh] bg-white border-r border-black/20 z-20 flex flex-col transition-all">
                <header className="w-full py-3 px-3 border-b border-black/5 rounded-md">
                    <div className="group flex items-stretch justify-between transition-all rounded-md">
                        <span className="h-6 flex-1 w-full bg-transparent border border-transparent focus:outline-none group-hover:bg-black/5 hover:bg-black/10 rounded-l-md text-sm font-semibold px-2 whitespace-nowrap overflow-hidden text-ellipsis">资源</span>
                    </div>
                </header>
            </div>
        )
    );
};
