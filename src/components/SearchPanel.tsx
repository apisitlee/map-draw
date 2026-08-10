import React, { useState, useEffect } from 'react';
import { useMap } from '../context/MapContext';
import { Search, X, ChevronLeft, ChevronRight, MapPin, Route, Bus, Plus, Loader2 } from 'lucide-react';
import { LayerItemData, ViaStop, Busline } from '../types';

export const SearchPanel: React.FC = () => {
  const {
    isSearchPanelOpen,
    setIsSearchPanelOpen,
    currentCity,
    addLayerFromSearch,
    isPureMap,
  } = useMap();

  const [keyword, setKeyword] = useState('');
  const [currentCategory, setCurrentCategory] = useState<'all' | 'point' | 'line' | 'station'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<LayerItemData[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const executeSearch = (page: number = 1, cat: 'all' | 'point' | 'line' | 'station' = currentCategory) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setCurrentPage(page);
    setIsSearching(true);

    const windowAMap = (window as any).AMap;
    if (!windowAMap) {
      setIsSearching(false);
      return;
    }

    windowAMap.plugin(['AMap.PlaceSearch', 'AMap.LineSearch', 'AMap.StationSearch'], () => {
      const opts = { city: currentCity, citylimit: false, pageSize, pageIndex: page };
      const placeSearch = new windowAMap.PlaceSearch(opts);
      const lineSearch = new windowAMap.LineSearch({ ...opts, extensions: 'all' });
      const stationSearch = new windowAMap.StationSearch(opts);

      const p1 =
        cat === 'all' || cat === 'point'
          ? new Promise<LayerItemData[]>((resolve) => {
              placeSearch.search(trimmed, (status: string, result: any) => {
                if (status === 'complete' && result.poiList && result.poiList.pois) {
                  resolve(
                    result.poiList.pois.map((i: any) => ({
                      id: 'poi_' + i.id,
                      name: i.name,
                      sub: i.address || '暂无详细地址',
                      category: 'POI 地点',
                      iconClass: 'fa-solid fa-location-dot',
                      iconBgClass: 'icon-poi',
                      type: 'point',
                      location: i.location ? [i.location.lng, i.location.lat] : [116.397428, 39.90923],
                    }))
                  );
                } else {
                  resolve([]);
                }
              });
            })
          : Promise.resolve([]);

      const p2 =
        cat === 'all' || cat === 'line'
          ? new Promise<LayerItemData[]>((resolve) => {
              lineSearch.search(trimmed, (status: string, result: any) => {
                if (status === 'complete' && result.lineInfo) {
                  resolve(
                    result.lineInfo.map((i: any) => {
                      const formattedDistance = parseFloat(i.distance).toFixed(2);
                      return {
                        id: 'line_' + i.id,
                        name: i.name,
                        sub: `全程 ${formattedDistance}km (${i.start_stop} ➔ ${i.end_stop})`,
                        category: '线路',
                        iconClass: 'fa-solid fa-route',
                        iconBgClass: 'icon-line',
                        type: 'line',
                        path: i.path ? i.path.map((p: any) => [p.lng, p.lat]) : [],
                        viaStops: i.via_stops || [],
                      };
                    })
                  );
                } else {
                  resolve([]);
                }
              });
            })
          : Promise.resolve([]);

      const p3 =
        cat === 'all' || cat === 'station'
          ? new Promise<LayerItemData[]>((resolve) => {
              stationSearch.search(trimmed, (status: string, result: any) => {
                if (status === 'complete' && result.stationInfo) {
                  resolve(
                    result.stationInfo.map((i: any) => ({
                      id: 'station_' + i.id,
                      name: i.name,
                      sub: `途经线路: ${i.buslines ? i.buslines.length : 0} 条`,
                      category: '站点',
                      iconClass: 'fa-solid fa-bus-simple',
                      iconBgClass: 'icon-station',
                      type: 'station',
                      location: i.location ? [i.location.lng, i.location.lat] : [116.397428, 39.90923],
                      buslines: i.buslines || [],
                    }))
                  );
                } else {
                  resolve([]);
                }
              });
            })
          : Promise.resolve([]);

      Promise.all([p1, p2, p3]).then(([resPoi, resLine, resStation]) => {
        const combined = [...resPoi, ...resLine, ...resStation];
        setResults(combined);
        setHasMore(resPoi.length === pageSize || resLine.length === pageSize || resStation.length === pageSize);
        setIsSearching(false);
      });
    });
  };

  const handleCategoryChange = (cat: 'all' | 'point' | 'line' | 'station') => {
    setCurrentCategory(cat);
    executeSearch(1, cat);
  };

  const handleAddAssociatedStation = (stop: ViaStop) => {
    const stationName = stop.name;
    const windowAMap = (window as any).AMap;
    if (!windowAMap) return;

    windowAMap.plugin('AMap.StationSearch', () => {
      const stationSearch = new windowAMap.StationSearch({ city: currentCity });
      stationSearch.search(stationName, (status: string, result: any) => {
        let stationItem: LayerItemData | null = null;
        if (status === 'complete' && result.stationInfo && result.stationInfo.length > 0) {
          const i = result.stationInfo[0];
          stationItem = {
            id: 'station_' + i.id + '_' + Date.now(),
            name: i.name,
            sub: `途经线路: ${i.buslines ? i.buslines.length : 0} 条`,
            category: '站点',
            iconClass: 'fa-solid fa-bus-simple',
            iconBgClass: 'icon-station',
            type: 'station',
            location: i.location ? [i.location.lng, i.location.lat] : [116.397428, 39.90923],
            buslines: i.buslines || [],
          };
        } else {
          const loc = stop.location
            ? (stop.location as any).lng
              ? [(stop.location as any).lng, (stop.location as any).lat]
              : stop.location
            : [116.397428, 39.90923];
          stationItem = {
            id: 'station_' + (stop.id || Date.now()) + '_' + Date.now(),
            name: stop.name,
            sub: '线路关联站点',
            category: '站点',
            iconClass: 'fa-solid fa-bus-simple',
            iconBgClass: 'icon-station',
            type: 'station',
            location: loc as [number, number],
            buslines: [],
          };
        }

        if (stationItem) {
          addLayerFromSearch(stationItem);
        }
      });
    });
  };

  const handleAddAssociatedLine = (busline: Busline) => {
    const lineSearchName = busline.name ? busline.name.split('(')[0] : (busline as any);
    const windowAMap = (window as any).AMap;
    if (!windowAMap) return;

    windowAMap.plugin('AMap.LineSearch', () => {
      const lineSearch = new windowAMap.LineSearch({ city: currentCity, extensions: 'all' });
      lineSearch.search(lineSearchName, (status: string, result: any) => {
        if (status === 'complete' && result.lineInfo && result.lineInfo.length > 0) {
          let selectedLine = result.lineInfo[0];
          if (busline.start_stop && busline.end_stop) {
            const matched = result.lineInfo.find(
              (l: any) => l.start_stop === busline.start_stop && l.end_stop === busline.end_stop
            );
            if (matched) selectedLine = matched;
          }

          const formattedDistance = parseFloat(selectedLine.distance).toFixed(2);
          const item: LayerItemData = {
            id: 'line_' + selectedLine.id + '_' + Date.now(),
            name: selectedLine.name,
            sub: `全程 ${formattedDistance}km (${selectedLine.start_stop} ➔ ${selectedLine.end_stop})`,
            category: '线路',
            iconClass: 'fa-solid fa-route',
            iconBgClass: 'icon-line',
            type: 'line',
            path: selectedLine.path ? selectedLine.path.map((p: any) => [p.lng, p.lat]) : [],
            viaStops: selectedLine.via_stops || [],
          };
          addLayerFromSearch(item);
        } else {
          alert(`检索线路 "${lineSearchName}" 详细数据失败`);
        }
      });
    });
  };

  if (!isSearchPanelOpen || isPureMap) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[480px] max-h-[calc(100vh-90px)] bg-white/88 backdrop-blur-xl rounded-2xl shadow-xl border border-white/70 z-[22] flex flex-col transition-all">
      <div className="p-3.5 flex items-center justify-between border-b border-black/5">
        <span className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5">
          <Search className="w-4 h-4 text-[#007AFF]" />
          搜索探索
        </span>
        <button
          className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
          onClick={() => setIsSearchPanelOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto flex-1">
        {/* Search input box */}
        <div className="flex gap-2 mb-3 relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && executeSearch(1)}
            placeholder="搜索地点/公交/地铁站点..."
            className="flex-1 py-2 pr-12 pl-3 bg-black/5 border-none rounded-xl text-xs text-[#1c1c1e] outline-none focus:bg-black/10 focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
          />
          <span className="absolute right-[52px] top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#8e8e93] bg-black/5 px-1.5 py-0.5 rounded pointer-events-none">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </span>
          <button
            className="px-3 bg-[#007AFF] text-white rounded-xl font-medium text-xs flex items-center justify-center cursor-pointer hover:bg-[#0056b3] transition-colors"
            onClick={() => executeSearch(1)}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Category filter bar */}
        {(keyword || results.length > 0) && (
          <div className="bg-black/5 p-0.5 rounded-lg mb-3 flex gap-0.5">
            {[
              { id: 'all', label: '全部' },
              { id: 'point', label: '地点' },
              { id: 'line', label: '线路' },
              { id: 'station', label: '站点' },
            ].map((cat) => (
              <div
                key={cat.id}
                className={`flex-1 text-center py-1 text-[11px] cursor-pointer rounded-md font-medium transition-all select-none ${
                  currentCategory === cat.id
                    ? 'bg-white text-[#007AFF] shadow-xs font-semibold'
                    : 'text-[#3c3c43] hover:text-[#007AFF]'
                }`}
                onClick={() => handleCategoryChange(cat.id as any)}
              >
                {cat.label}
              </div>
            ))}
          </div>
        )}

        {/* Results list */}
        {isSearching ? (
          <div className="text-[#8e8e93] text-center text-xs py-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
            正在检索...
          </div>
        ) : results.length === 0 ? (
          keyword ? (
            <div className="text-[#8e8e93] text-center text-xs py-4">未查找到匹配数据</div>
          ) : null
        ) : (
          <ul className="space-y-2">
            {results.map((item) => (
              <li
                key={item.id}
                className="bg-white/85 p-2.5 rounded-xl border border-black/5 hover:bg-[#007AFF]/5 transition-all"
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                      item.type === 'line'
                        ? 'bg-emerald-100 text-emerald-600'
                        : item.type === 'station'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-[#007AFF]'
                    }`}
                  >
                    {item.type === 'line' ? (
                      <Route className="w-3.5 h-3.5" />
                    ) : item.type === 'station' ? (
                      <Bus className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 mx-2 overflow-hidden">
                    <div className="font-semibold text-xs text-[#1c1c1e] truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#8e8e93] truncate" title={item.sub}>
                      {item.sub}
                    </div>
                  </div>

                  <button
                    className="px-2 py-1 text-[11px] rounded-md bg-[#007AFF] text-white hover:bg-[#0056b3] transition-colors flex items-center gap-1 cursor-pointer"
                    onClick={() => addLayerFromSearch(item)}
                  >
                    <Plus className="w-3 h-3" /> 添加图层
                  </button>
                </div>

                {/* Associated ViaStops */}
                {item.type === 'line' && item.viaStops && item.viaStops.length > 0 && (
                  <div className="mt-2 pt-1 border-t border-dashed border-black/10">
                    <div className="text-[10px] font-semibold text-[#8e8e93] mb-1">
                      途径站点 ({item.viaStops.length}):
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                      {item.viaStops.map((stop) => (
                        <button
                          key={stop.id || stop.name}
                          className="text-[10px] text-[#007AFF] bg-white border border-[#007AFF]/20 hover:bg-[#007AFF]/10 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                          onClick={() => handleAddAssociatedStation(stop)}
                        >
                          <Plus className="w-2.5 h-2.5" />
                          {stop.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Associated Buslines for Station */}
                {item.type === 'station' && item.buslines && item.buslines.length > 0 && (
                  <div className="mt-2 pt-1 border-t border-dashed border-black/10">
                    <div className="text-[10px] font-semibold text-[#8e8e93] mb-1">
                      途径线路方向 ({item.buslines.length}):
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {item.buslines.map((b, idx) => (
                        <div key={idx} className="bg-black/5 p-1 rounded text-[11px] flex items-center justify-between">
                          <span className="font-medium text-[#1c1c1e] text-[10px] truncate max-w-[280px]">
                            {b.start_stop && b.end_stop ? `${b.name} (${b.start_stop} ➔ ${b.end_stop})` : b.name}
                          </span>
                          <button
                            className="text-[10px] text-[#007AFF] bg-white border border-[#007AFF]/20 hover:bg-[#007AFF]/10 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                            onClick={() => handleAddAssociatedLine(b)}
                          >
                            <Plus className="w-2.5 h-2.5" /> 添加
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Pagination Bar */}
        {results.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-xs text-[#8e8e93]">
            <button
              className="px-2.5 py-1 bg-black/5 rounded-md text-[11px] text-[#007AFF] font-medium flex items-center gap-1 disabled:opacity-40 disabled:text-[#8e8e93] cursor-pointer"
              disabled={currentPage === 1}
              onClick={() => executeSearch(currentPage - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> 上一页
            </button>

            <span>第 {currentPage} 页</span>

            <button
              className="px-2.5 py-1 bg-black/5 rounded-md text-[11px] text-[#007AFF] font-medium flex items-center gap-1 disabled:opacity-40 disabled:text-[#8e8e93] cursor-pointer"
              disabled={!hasMore}
              onClick={() => executeSearch(currentPage + 1)}
            >
              下一页 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
