import React, { useRef } from 'react';
import { useMap } from '../context/MapContext';
import {
  MapPin,
  RotateCcw,
  RotateCw,
  Search,
  Square,
  Circle as CircleIcon,
  Shapes,
  Image as ImageIcon,
  PenTool,
  Type,
  Download,
  Share,
  Sliders,
  Flower2,
  Map,
  MousePointer2,
  Hand,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentCity,
    canUndo,
    canRedo,
    undo,
    redo,
    currentActiveTool,
    activateDrawTool,
    deactivateDrawTools,
    mouseInteractionMode,
    setMouseInteractionMode,
    isPureMap,
    togglePureMapMode,
    isCityPanelOpen,
    setIsCityPanelOpen,
    isSearchPanelOpen,
    setIsSearchPanelOpen,
    isStylePanelOpen,
    setIsStylePanelOpen,
    setIsExportModalOpen,
    importJSONData,
    setPendingUploadedImageUrl,
    mouseTool,
  } = useMap();

  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          importJSONData(parsed);
          alert('JSON 数据成功导入，图层嵌套结构与脊线位置已完美还原！');
        } catch (err) {
          console.error(err);
          alert('解析 JSON 文件失败，请确认文件格式无误。');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPendingUploadedImageUrl(url);
        if (mouseTool) {
          const windowAMap = (window as any).AMap;
          mouseTool.marker({
            icon: new windowAMap.Icon({
              size: new windowAMap.Size(60, 60),
              image: url,
              imageSize: new windowAMap.Size(60, 60),
            }),
            anchor: 'center',
          });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  if (isPureMap) return null;

  return (
    <header className="h-[48px] w-full bg-white/90 backdrop-blur-md border-b border-black/10 flex items-center justify-between px-4 z-50 shadow-xs shrink-0 transition-all">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={jsonFileInputRef}
        accept=".json"
        className="hidden"
        onChange={handleJsonFileChange}
      />
      <input
        type="file"
        id="map-image-upload-input"
        ref={imageFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Header Left */}
      <div className="flex items-center gap-3">
        <div className="text-[15px] font-bold text-[#1c1c1e] flex items-center gap-2 tracking-tight">
          <Map className="w-5 h-5 text-[#007AFF]" />
          <span>
            绘·图{' '}
            <span className="text-[11px] font-normal text-[#8e8e93]">
              (map draw)
            </span>
          </span>
        </div>

        <div className="w-[1px] h-4 bg-black/10" />

        <button
          className={`h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            isCityPanelOpen ? 'bg-[#007AFF] text-white' : 'bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF]'
          }`}
          onClick={() => setIsCityPanelOpen(!isCityPanelOpen)}
          title="切换城市或定位"
        >
          <MapPin className="w-3.5 h-3.5 text-[#ff3b30]" />
          <span>{currentCity}</span>
        </button>

        <div className="w-[1px] h-4 bg-black/10" />

        {/* Undo / Redo */}
        <button
          className="h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={!canUndo}
          onClick={undo}
          title="撤销 (⌘Z / Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          撤销
        </button>

        <button
          className="h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={!canRedo}
          onClick={redo}
          title="重做 (⌘Y / Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          重做
        </button>
      </div>

      {/* Header Center Toolbar */}
      <div className="flex items-center gap-1 px-1.5 py-1">
        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs text-[#3c3c43] transition-all cursor-pointer ${
            isSearchPanelOpen
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
          title="搜索探索 (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-3 bg-black/10 mx-0.5" />

        {/* 鼠标模式切换 (选择模式 / 移动模式) */}
        <div className="flex items-center bg-black/5 p-0.5 rounded-lg gap-0.5 mr-0.5">
          <button
            className={`h-6.5 px-2 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              mouseInteractionMode === 'select' && !currentActiveTool
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-[#3c3c43] hover:bg-black/5 hover:text-[#007AFF]'
            }`}
            onClick={() => {
              deactivateDrawTools();
              setMouseInteractionMode('select');
            }}
            title="选择模式 (V)：点击选中图层，按 Shift 多选，拖拽框选"
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">选择</span>
          </button>

          <button
            className={`h-6.5 px-2 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              mouseInteractionMode === 'pan' && !currentActiveTool
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-[#3c3c43] hover:bg-black/5 hover:text-[#007AFF]'
            }`}
            onClick={() => {
              deactivateDrawTools();
              setMouseInteractionMode('pan');
            }}
            title="移动模式 (W)：拖拽平移地图 (按住空格键亦可随时拖拽平移)"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="text-[11px]">移动</span>
          </button>
        </div>

        <div className="w-[1px] h-3 bg-black/10 mx-0.5" />

        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
            currentActiveTool === 'rectangle'
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'text-[#3c3c43] hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => activateDrawTool('rectangle')}
          title="矩形 (R)"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
            currentActiveTool === 'circle'
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'text-[#3c3c43] hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => activateDrawTool('circle')}
          title="圆形 (O)"
        >
          <CircleIcon className="w-4 h-4" />
        </button>

        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
            currentActiveTool === 'polygon'
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'text-[#3c3c43] hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => activateDrawTool('polygon')}
          title="多边形"
        >
          <Shapes className="w-4 h-4" />
        </button>

        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
            currentActiveTool === 'image'
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'text-[#3c3c43] hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => activateDrawTool('image')}
          title="图片标记 (Shift+⌘/Ctrl+K)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
            currentActiveTool === 'pen'
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'text-[#3c3c43] hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => activateDrawTool('pen')}
          title="钢笔/折线 (P)"
        >
          <PenTool className="w-4 h-4" />
        </button>

        <button
          className={`w-7.5 h-7.5 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
            currentActiveTool === 'text'
              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
              : 'text-[#3c3c43] hover:bg-[#007AFF]/20 hover:text-[#007AFF]'
          }`}
          onClick={() => activateDrawTool('text')}
          title="文字标注 (T)"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-3">
        <button
          className="h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF] cursor-pointer"
          onClick={() => jsonFileInputRef.current?.click()}
          title="导入 JSON 配置文件"
        >
          <Download className="w-3.5 h-3.5" />
          导入
        </button>

        <button
          className="h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF] cursor-pointer"
          onClick={() => setIsExportModalOpen(true)}
          title="导出数据或保存截图"
        >
          <Share className="w-3.5 h-3.5" />
          导出
        </button>

        <div className="w-[1px] h-4 bg-black/10" />

        <button
          className={`h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            isStylePanelOpen ? 'bg-[#007AFF] text-white' : 'bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF]'
          }`}
          onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
          title="地图基础设置"
        >
          <Sliders className="w-3.5 h-3.5" />
          设置
        </button>

        <button
          className="h-8 px-3 rounded-lg border border-transparent text-xs font-medium text-[#1c1c1e] flex items-center gap-1.5 transition-all whitespace-nowrap bg-black/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF] cursor-pointer"
          onClick={togglePureMapMode}
          title="进入专注纯净模式"
        >
          <Flower2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>禅模式</span>
        </button>
      </div>
    </header>
  );
};
