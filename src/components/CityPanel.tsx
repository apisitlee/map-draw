import React from 'react';
import { useMap } from '../context/MapContext';
import { Building2, Crosshair, X } from 'lucide-react';

const CITIES = [
  '全国',
  '北京市',
  '上海市',
  '广州市',
  '深圳市',
  '杭州市',
  '南京市',
  '成都市',
  '武汉市',
];

export const CityPanel: React.FC = () => {
  const { isCityPanelOpen, setIsCityPanelOpen, currentCity, selectCity, mapInstance, isPureMap } = useMap();

  if (!isCityPanelOpen || isPureMap) return null;

  const handleUseCurrentLocation = () => {
    const windowAMap = (window as any).AMap;
    if (!windowAMap) return;

    windowAMap.plugin('AMap.CitySearch', () => {
      const citySearch = new windowAMap.CitySearch();
      citySearch.getLocalCity((status: string, result: any) => {
        if (status === 'complete' && result.city) {
          selectCity(result.city);
          if (result.bounds && mapInstance) {
            mapInstance.setBounds(result.bounds);
          }
        } else {
          alert('获取当前定位失败');
        }
      });
    });
  };

  return (
    <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-80px)] bg-white/88 backdrop-blur-xl rounded-2xl shadow-xl border border-white/70 z-[22] flex flex-col transition-all">
      <div className="p-3.5 flex items-center justify-between border-b border-black/5">
        <span className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#007AFF]" />
          选择城市
        </span>
        <button
          className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
          onClick={() => setIsCityPanelOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto flex-1">
        <button
          className="w-full py-2.5 px-3 rounded-xl border-none bg-[#007AFF] text-white text-xs font-medium cursor-pointer flex items-center justify-center gap-2 mb-3 hover:bg-[#0056b3] transition-colors"
          onClick={handleUseCurrentLocation}
        >
          <Crosshair className="w-4 h-4" />
          使用当前定位
        </button>

        <div className="grid grid-cols-3 gap-2">
          {CITIES.map((city) => (
            <div
              key={city}
              className={`py-2 text-center text-xs font-medium rounded-xl cursor-pointer transition-all ${
                currentCity === city
                  ? 'bg-[#007AFF] text-white font-semibold'
                  : 'bg-black/5 text-[#1c1c1e] hover:bg-[#007AFF]/15 hover:text-[#007AFF]'
              }`}
              onClick={() => selectCity(city)}
            >
              {city}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
