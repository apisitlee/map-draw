import React, { useRef } from 'react';
import { useMap } from '../context/MapContext';
import {
  Sliders,
  X,
  Type,
  Compass,
  FileUp,
  Plus,
  Trash2,
  Palette,
  Bookmark,
  MountainSnow,
  Route,
  MapPin,
  Building,
  Bolt,
} from 'lucide-react';

const MAP_THEMES = [
  { key: 'amap://styles/normal', title: '标准(normal)', class: 'tp-img-normal' },
  { key: 'amap://styles/macaron', title: '马卡龙(macaron)', class: 'tp-img-macaron' },
  { key: 'amap://styles/graffit', title: '涂鸦(graffiti)', class: 'tp-img-graffiti' },
  { key: 'amap://styles/whitesmoke', title: '远山黛(whitesmoke)', class: 'tp-img-whitesmoke' },
  { key: 'amap://styles/dark', title: '幻影黑(dark)', class: 'tp-img-dark' },
  { key: 'amap://styles/fresh', title: '草色青(fresh)', class: 'tp-img-fresh' },
  { key: 'amap://styles/darkblue', title: '极夜蓝(darkblue)', class: 'tp-img-darkblue' },
  { key: 'amap://styles/blue', title: '靛青蓝(blue)', class: 'tp-img-blue' },
  { key: 'amap://styles/light', title: '月光银(light)', class: 'tp-img-light' },
  { key: 'amap://styles/grey', title: '雅士灰(grey)', class: 'tp-img-grey' },
];

export const SettingPanel: React.FC = () => {
  const {
    isStylePanelOpen,
    setIsStylePanelOpen,
    openedLeftPanel,
    setOpenedLeftPanel,
    globalTextConfig,
    updateGlobalTextConfig,
    customFonts,
    addCustomFont,
    removeCustomFont,
    mapInstance,
    currentMapStyle,
    applyMapTheme,
    activeCoreFeatures,
    toggleFeatureGroup,
    applyPreset,
    customPresets,
    saveNewPreset,
    deletePreset,
    isPureMap,
  } = useMap();

  const fontFileInputRef = useRef<HTMLInputElement>(null);

  if (openedLeftPanel !== 'setting' || isPureMap) return null;

  const currentRotation = mapInstance ? mapInstance.getRotation() || 0 : 0;

  const handleRotationChange = (val: number) => {
    if (mapInstance) {
      mapInstance.setRotation(val);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await addCustomFont(e.target.files[0]);
    }
    e.target.value = '';
  };

  const renderFontOptions = () => {
    return (
      <>
        <optgroup label="默认字体">
          <option value="-apple-system, sans-serif">默认系统字体</option>
        </optgroup>
        {customFonts.length > 0 && (
          <optgroup label="自定义字体">
            {customFonts.map((f) => (
              <option key={f.name} value={f.name}>
                ⭐ {f.name}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  };

  return (
    <div className="absolute top-0 left-[55px] w-[340px] h-full bg-white border-r border-black/30 z-20 flex flex-col transition-all">
      <div className="p-3.5 flex items-center justify-between border-b border-black/5">
        <span className="text-sm font-semibold text-[#1c1c1e] flex items-center gap-1.5">
          设置
        </span>
        <button
          className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
          onClick={() => setOpenedLeftPanel(null)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto flex-1 space-y-3.5">
        {/* Global Text Config */}
        <div>
          <div className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5 mb-1.5">
            <Type className="w-3.5 h-3.5 text-[#007AFF]" /> 全局标注文本样式设置
          </div>
          <div className="bg-black/2.5 p-2.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43]">默认字体</label>
              <select
                value={globalTextConfig.fontFamily}
                onChange={(e) => updateGlobalTextConfig('fontFamily', e.target.value)}
                className="px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
              >
                {renderFontOptions()}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43]">默认字号(px)</label>
              <input
                type="number"
                min="10"
                max="48"
                value={globalTextConfig.fontSize}
                onChange={(e) => updateGlobalTextConfig('fontSize', parseInt(e.target.value, 10))}
                className="w-14 px-1.5 py-0.5 rounded-md border border-[#d1d1d6] text-xs text-center outline-none bg-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43]">默认字重</label>
              <select
                value={globalTextConfig.fontWeight}
                onChange={(e) => updateGlobalTextConfig('fontWeight', e.target.value)}
                className="px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
              >
                <option value="400">常规 (400)</option>
                <option value="600">加粗 (600)</option>
                <option value="700">粗体 (700)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map Rotation */}
        <div>
          <div className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5 mb-1.5">
            <Compass className="w-3.5 h-3.5 text-[#007AFF]" /> 地图视角与旋转设置
          </div>
          <div className="bg-black/2.5 p-2.5 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43]">地图旋转角度 (°)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={currentRotation}
                  onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
                  className="w-20 accent-[#007AFF]"
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={currentRotation}
                  onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
                  className="w-12 px-1 py-0.5 rounded-md border border-[#d1d1d6] text-xs text-center outline-none bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Font Management */}
        <div>
          <div className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5 mb-1.5">
            <FileUp className="w-3.5 h-3.5 text-[#007AFF]" /> 自定义字体管理
          </div>
          <div className="bg-black/2.5 p-2.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43]">添加本地字体文件</label>
              <button
                className="px-2 py-1 text-[11px] rounded-md bg-[#007AFF] text-white hover:bg-[#0056b3] transition-colors flex items-center gap-1 cursor-pointer"
                onClick={() => fontFileInputRef.current?.click()}
              >
                <Plus className="w-3 h-3" /> 上传字体
              </button>
              <input
                type="file"
                ref={fontFileInputRef}
                accept=".ttf,.otf,.woff,.woff2"
                className="hidden"
                onChange={handleFontUpload}
              />
            </div>
            <div className="text-[10px] text-[#8e8e93]">
              支持 .ttf, .otf, .woff 格式，将持久化保存于浏览器 IndexedDB。
            </div>

            {customFonts.length > 0 && (
              <div className="space-y-1 pt-1">
                {customFonts.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between bg-white px-2 py-1 rounded-md text-xs"
                  >
                    <span style={{ fontFamily: `"${f.name}", sans-serif` }}>{f.name}</span>
                    <button
                      className="text-[#ff3b30] hover:bg-red-50 p-1 rounded cursor-pointer"
                      onClick={() => removeCustomFont(f.name)}
                      title="删除字体"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Skins */}
        <div>
          <div className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5 mb-1.5">
            <Palette className="w-3.5 h-3.5 text-[#007AFF]" /> 预设视觉皮肤
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MAP_THEMES.map((theme) => (
              <div
                key={theme.key}
                className={`border-2 rounded-xl overflow-hidden cursor-pointer bg-white transition-all shadow-xs hover:-translate-y-0.5 hover:shadow-md ${currentMapStyle === theme.key ? 'border-[#007AFF]' : 'border-transparent'
                  }`}
                onClick={() => applyMapTheme(theme.key)}
              >
                <div className={`h-[65px] bg-cover bg-center relative ${theme.class}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent flex items-end p-1.5">
                    <span className="text-white text-[11px] font-semibold drop-shadow-xs truncate">
                      {theme.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Toggles & Presets */}
        <div>
          <div className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#007AFF]" /> 地图要素显隐控制
          </div>

          <div className="flex gap-1.5 mb-3 items-center">
            <select
              className="flex-1 text-xs bg-black/5 text-[#1c1c1e] px-2.5 py-1.5 rounded-lg font-medium outline-none"
              onChange={(e) => applyPreset(e.target.value)}
            >
              <option value="default">全功能标准</option>
              <option value="minimal">极简透视 (隐藏背景与建筑)</option>
              <option value="traffic">交通干线重点 (仅道路与标注)</option>
              {Object.entries(customPresets).map(([key, p]) => (
                <option key={key} value={key}>
                  ⭐ {(p as any).name}
                </option>
              ))}
            </select>

            <button
              className="px-2 py-1.5 text-[11px] rounded-md bg-[#007AFF] text-white hover:bg-[#0056b3] transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              onClick={() => {
                const name = prompt('请输入新要素预设的名称：', '我的自定义预设');
                if (name) saveNewPreset(name);
              }}
              title="保存当前为预设"
            >
              <Bookmark className="w-3 h-3" /> 保存
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-black/2.5 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43] flex items-center gap-1">
                <MountainSnow className="w-3.5 h-3.5 text-amber-500" /> 背景区域面
              </label>
              <input
                type="checkbox"
                checked={activeCoreFeatures.has('bg')}
                onChange={(e) => toggleFeatureGroup('bg', e.target.checked)}
                className="w-4 h-4 accent-[#007AFF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43] flex items-center gap-1">
                <Route className="w-3.5 h-3.5 text-blue-500" /> 道路与线路
              </label>
              <input
                type="checkbox"
                checked={activeCoreFeatures.has('road')}
                onChange={(e) => toggleFeatureGroup('road', e.target.checked)}
                className="w-4 h-4 accent-[#007AFF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> 标注与地名
              </label>
              <input
                type="checkbox"
                checked={activeCoreFeatures.has('point')}
                onChange={(e) => toggleFeatureGroup('point', e.target.checked)}
                className="w-4 h-4 accent-[#007AFF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3c3c43] flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-500" /> 3D/2D 建筑物
              </label>
              <input
                type="checkbox"
                checked={activeCoreFeatures.has('building')}
                onChange={(e) => toggleFeatureGroup('building', e.target.checked)}
                className="w-4 h-4 accent-[#007AFF] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
