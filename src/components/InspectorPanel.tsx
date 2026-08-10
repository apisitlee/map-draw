import React from 'react';
import { useMap } from '../context/MapContext';
import {
  Info,
  X,
  RotateCcw,
  Check,
  PenSquare,
  Layers,
  Route,
  Bus,
  MapPin,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FolderPlus,
  Type,
  Shapes,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    isInspectorPanelOpen,
    setIsInspectorPanelOpen,
    focusedLayerId,
    multiSelectedLayerIds,
    layerMap,
    updateStyle,
    updateShapeStyle,
    updateImageStyle,
    updatePenStyle,
    updateTextStyle,
    updateStationStyle,
    updateSinglePointStyle,
    updateLayerTransform,
    toggleUniversalEditing,
    toggleStationsControl,
    updateStopOverride,
    clearStopOverride,
    toggleSinglePointLabelControl,
    editTextContent,
    toggleLayerVisibility,
    groupSelectedLayers,
    alignSelectedLayers,
    startBoxSelectNodesMode,
    openDevToolsColorPicker,
    addLayerFromSearch,
    globalTextConfig,
    customFonts,
    isPureMap,
  } = useMap();

  if (!isInspectorPanelOpen || isPureMap) return null;

  // Multi-selection view
  if (multiSelectedLayerIds.size > 1) {
    return (
      <div className="absolute top-[60px] right-4 w-[340px] max-h-[calc(100vh-120px)] bg-white/88 backdrop-blur-xl rounded-2xl shadow-xl border border-white/70 z-20 flex flex-col transition-all">
        <div className="p-3.5 flex items-center justify-between border-b border-black/5">
          <span className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#007AFF]" /> 图层检查器
          </span>
          <button
            className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
            onClick={() => setIsInspectorPanelOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto flex-1 space-y-3">
          <div className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#007AFF]" /> 已选中 {multiSelectedLayerIds.size} 个图层
          </div>

          <div>
            <div className="text-xs font-semibold text-[#1c1c1e] mb-1">组合与成组</div>
            <button
              className="w-full py-2 bg-[#007AFF] text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-[#0056b3] transition-colors flex items-center justify-center gap-1.5"
              onClick={groupSelectedLayers}
            >
              <FolderPlus className="w-4 h-4" /> 将选中图层组合成组
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#1c1c1e] mb-1.5">点位图层多选对齐布局</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                className="py-1.5 bg-black/5 hover:bg-[#007AFF]/15 hover:text-[#007AFF] text-[#1c1c1e] rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                onClick={() => alignSelectedLayers('left')}
              >
                <AlignLeft className="w-3.5 h-3.5" /> 左对齐
              </button>
              <button
                className="py-1.5 bg-black/5 hover:bg-[#007AFF]/15 hover:text-[#007AFF] text-[#1c1c1e] rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                onClick={() => alignSelectedLayers('centerX')}
              >
                <AlignCenter className="w-3.5 h-3.5" /> 水平居中
              </button>
              <button
                className="py-1.5 bg-black/5 hover:bg-[#007AFF]/15 hover:text-[#007AFF] text-[#1c1c1e] rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                onClick={() => alignSelectedLayers('right')}
              >
                <AlignRight className="w-3.5 h-3.5" /> 右对齐
              </button>
              <button
                className="py-1.5 bg-black/5 hover:bg-[#007AFF]/15 hover:text-[#007AFF] text-[#1c1c1e] rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                onClick={() => alignSelectedLayers('top')}
              >
                <AlignJustify className="w-3.5 h-3.5" /> 顶对齐
              </button>
              <button
                className="py-1.5 bg-black/5 hover:bg-[#007AFF]/15 hover:text-[#007AFF] text-[#1c1c1e] rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                onClick={() => alignSelectedLayers('centerY')}
              >
                <AlignJustify className="w-3.5 h-3.5 rotate-90" /> 垂直居中
              </button>
              <button
                className="py-1.5 bg-black/5 hover:bg-[#007AFF]/15 hover:text-[#007AFF] text-[#1c1c1e] rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                onClick={() => alignSelectedLayers('bottom')}
              >
                <AlignJustify className="w-3.5 h-3.5 rotate-180" /> 底对齐
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!focusedLayerId || !layerMap.has(focusedLayerId)) {
    return (
      <div className="absolute top-[60px] right-4 w-[340px] max-h-[calc(100vh-120px)] bg-white/88 backdrop-blur-xl rounded-2xl shadow-xl border border-white/70 z-20 flex flex-col transition-all">
        <div className="p-3.5 flex items-center justify-between border-b border-black/5">
          <span className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#007AFF]" /> 图层检查器
          </span>
          <button
            className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
            onClick={() => setIsInspectorPanelOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[#8e8e93] text-center text-xs p-6">请在左侧选择一个或多个图层以查看属性</div>
      </div>
    );
  }

  const layer = layerMap.get(focusedLayerId)!;
  const {
    data,
    style,
    stationStyle,
    singlePointStyle,
    shapeStyle,
    imageStyle,
    penStyle,
    textStyle,
    activeTab = 'style',
    visible,
    locked,
    isEditing,
  } = layer;
  const id = layer.data.id;

  const renderColorTrigger = (labelText: string, color: string, onChange: (color: string) => void) => (
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-medium text-[#3c3c43]">{labelText}</label>
      <div
        className={`flex items-center gap-1.5 bg-white px-2 py-1 border border-[#d1d1d6] rounded-md cursor-pointer text-xs select-none ${
          locked ? 'opacity-50 pointer-events-none' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          openDevToolsColorPicker(e.currentTarget, color, onChange);
        }}
      >
        <div className="w-4 h-4 rounded border border-black/15 shadow-inner" style={{ backgroundColor: color }} />
        <span className="font-mono text-[11px]">{color.toUpperCase()}</span>
      </div>
    </div>
  );

  const renderFontOptions = () => (
    <>
      <option value="-apple-system, sans-serif">默认系统字体</option>
      {customFonts.map((f) => (
        <option key={f.name} value={f.name}>
          ⭐ {f.name}
        </option>
      ))}
    </>
  );

  const renderAnchorGrid = (currentAnchor: string, updateFn: (key: string, val: any) => void) => {
    const anchors = [
      ['top-left', 'top-center', 'top-right'],
      ['middle-left', 'center', 'middle-right'],
      ['bottom-left', 'bottom-center', 'bottom-right'],
    ];

    return (
      <div className="flex items-start justify-between mb-2">
        <label className="text-xs font-medium text-[#3c3c43] mt-1">基准锚点</label>
        <div className="grid grid-cols-3 gap-1 w-[90px] h-[90px] bg-black/4 p-1 rounded-lg border border-[#d1d1d6]">
          {anchors.flat().map((a) => (
            <div
              key={a}
              className={`rounded cursor-pointer flex items-center justify-center transition-all border ${
                currentAnchor === a ? 'bg-[#007AFF] border-[#007AFF]' : 'bg-white hover:bg-[#007AFF]/15 border-transparent'
              }`}
              onClick={() => updateFn('anchor', a)}
              title={`锚点: ${a}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${currentAnchor === a ? 'bg-white' : 'bg-[#8e8e93]'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransformSection = () => (
    <>
      <div className="w-full border-t border-dashed border-black/12 my-2.5" />
      <div className="text-xs font-semibold text-[#1c1c1e] mb-2 flex items-center gap-1">
        <RotateCcw className="w-3.5 h-3.5 text-[#007AFF]" /> 图层旋转与翻转
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[#3c3c43]">旋转角度(°)</label>
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={layer.rotation || 0}
            disabled={locked}
            onChange={(e) => updateLayerTransform(id, 'rotation', e.target.value)}
            className="w-20 accent-[#007AFF]"
          />
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={layer.rotation || 0}
            disabled={locked}
            onChange={(e) => updateLayerTransform(id, 'rotation', e.target.value)}
            className="w-12 px-1 py-0.5 rounded-md border border-[#d1d1d6] text-xs text-center outline-none bg-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[#3c3c43]">水平翻转 (Flip X)</label>
        <input
          type="checkbox"
          checked={layer.flipX}
          disabled={locked}
          onChange={(e) => updateLayerTransform(id, 'flipX', e.target.checked)}
          className="w-4 h-4 accent-[#007AFF] cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[#3c3c43]">垂直翻转 (Flip Y)</label>
        <input
          type="checkbox"
          checked={layer.flipY}
          disabled={locked}
          onChange={(e) => updateLayerTransform(id, 'flipY', e.target.checked)}
          className="w-4 h-4 accent-[#007AFF] cursor-pointer"
        />
      </div>
    </>
  );

  return (
    <div className="absolute top-[60px] right-4 w-[340px] max-h-[calc(100vh-120px)] bg-white/88 backdrop-blur-xl rounded-2xl shadow-xl border border-white/70 z-20 flex flex-col transition-all">
      <div className="p-3.5 flex items-center justify-between border-b border-black/5">
        <span className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5 truncate max-w-[240px]">
          <Info className="w-4 h-4 text-[#007AFF]" /> 图层检查器 ({data.name})
        </span>
        <button
          className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
          onClick={() => setIsInspectorPanelOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs for Line & Station */}
      {(data.type === 'line' || data.type === 'station') && (
        <div className="flex bg-black/8 p-0.5 rounded-lg m-3 mb-0 gap-0.5">
          <button
            className={`flex-1 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-all ${
              activeTab === 'style' ? 'bg-white text-[#007AFF] shadow-xs font-semibold' : 'text-[#3c3c43]'
            }`}
            onClick={() => (layer.activeTab = 'style')}
          >
            样式管理
          </button>
          {data.type === 'line' && (
            <button
              className={`flex-1 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-all ${
                activeTab === 'stops' ? 'bg-white text-[#007AFF] shadow-xs font-semibold' : 'text-[#3c3c43]'
              }`}
              onClick={() => (layer.activeTab = 'stops')}
            >
              途径站点
            </button>
          )}
          {data.type === 'station' && (
            <button
              className={`flex-1 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-all ${
                activeTab === 'lines' ? 'bg-white text-[#007AFF] shadow-xs font-semibold' : 'text-[#3c3c43]'
              }`}
              onClick={() => (layer.activeTab = 'lines')}
            >
              经过线路
            </button>
          )}
        </div>
      )}

      <div className="p-3 overflow-y-auto flex-1">
        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-2">
            {/* Universal Editing Button */}
            {data.type !== 'text' && (
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#3c3c43]">地图交互编辑</label>
                <button
                  className={`px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1 cursor-pointer text-white transition-colors ${
                    isEditing ? 'bg-[#ff3b30] hover:bg-red-600' : 'bg-[#007AFF] hover:bg-[#0056b3]'
                  } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={locked}
                  onClick={() => toggleUniversalEditing(id)}
                >
                  {isEditing ? <Check className="w-3.5 h-3.5" /> : <PenSquare className="w-3.5 h-3.5" />}
                  {isEditing ? '完成编辑' : '开启地图编辑'}
                </button>
              </div>
            )}

            {(data.type === 'line' || data.type === 'pen') && isEditing && (
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#3c3c43]">批量编辑节点</label>
                <button
                  className="px-2.5 py-1 text-xs rounded-md bg-[#007AFF] text-white hover:bg-[#0056b3] transition-colors flex items-center gap-1 cursor-pointer"
                  onClick={startBoxSelectNodesMode}
                >
                  <Layers className="w-3.5 h-3.5" /> 鼠标框选脊线节点
                </button>
              </div>
            )}

            {/* LINE TYPE STYLING */}
            {data.type === 'line' && (
              <>
                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <Route className="w-3.5 h-3.5 text-[#007AFF]" /> 1. 线路基础样式
                </div>
                {renderColorTrigger('颜色', style.color, (val) => updateStyle(id, 'color', val))}

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">宽度(px)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={style.strokeWeight}
                      disabled={locked}
                      onChange={(e) => updateStyle(id, 'strokeWeight', e.target.value)}
                      className="w-20 accent-[#007AFF]"
                    />
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={style.strokeWeight}
                      disabled={locked}
                      onChange={(e) => updateStyle(id, 'strokeWeight', e.target.value)}
                      className="w-12 px-1 py-0.5 rounded-md border border-[#d1d1d6] text-xs text-center outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">线条样式</label>
                  <select
                    value={style.strokeStyle}
                    disabled={locked}
                    onChange={(e) => updateStyle(id, 'strokeStyle', e.target.value)}
                    className="px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
                  >
                    <option value="solid">实线</option>
                    <option value="dashed">虚线</option>
                  </select>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">显示方向箭头</label>
                  <input
                    type="checkbox"
                    checked={style.showDir}
                    disabled={locked}
                    onChange={(e) => updateStyle(id, 'showDir', e.target.checked)}
                    className="w-4 h-4 accent-[#007AFF] cursor-pointer"
                  />
                </div>

                <div className="w-full border-t border-dashed border-black/12 my-2" />

                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-[#007AFF]" /> 2. 沿途站点图标控制
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">显示站点图标</label>
                  <input
                    type="checkbox"
                    checked={stationStyle.showIcons}
                    disabled={locked}
                    onChange={(e) => toggleStationsControl(id, 'stationShowIcons', e.target.checked)}
                    className="w-4 h-4 accent-[#007AFF] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">图标形状</label>
                  <select
                    value={stationStyle.shape}
                    disabled={locked}
                    onChange={(e) => updateStationStyle(id, 'shape', e.target.value)}
                    className="px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
                  >
                    <option value="circle">圆形 Circle</option>
                    <option value="square">方形 Square</option>
                    <option value="diamond">菱形 Diamond</option>
                    <option value="pin">大头针 Pin</option>
                  </select>
                </div>

                {renderColorTrigger('图标颜色', stationStyle.color || style.color, (val) =>
                  updateStationStyle(id, 'color', val)
                )}

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">显示站点标签</label>
                  <input
                    type="checkbox"
                    checked={stationStyle.showLabel}
                    disabled={locked}
                    onChange={(e) => toggleStationsControl(id, 'stationShowLabel', e.target.checked)}
                    className="w-4 h-4 accent-[#007AFF] cursor-pointer"
                  />
                </div>

                {renderTransformSection()}
              </>
            )}

            {/* STATION / POINT TYPE STYLING */}
            {(data.type === 'station' || data.type === 'point') && (
              <>
                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#007AFF]" /> 图标与标签设置
                </div>

                {renderColorTrigger('图标颜色', style.color || '#ff9500', (val) => updateStyle(id, 'color', val))}

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">图标形状</label>
                  <select
                    value={data.type === 'point' ? singlePointStyle.shape : stationStyle.shape}
                    disabled={locked}
                    onChange={(e) =>
                      data.type === 'point'
                        ? updateSinglePointStyle(id, 'shape', e.target.value)
                        : updateStationStyle(id, 'shape', e.target.value)
                    }
                    className="px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
                  >
                    <option value="pin">大头针 Pin</option>
                    <option value="circle">圆形 Circle</option>
                    <option value="square">方形 Square</option>
                    <option value="diamond">菱形 Diamond</option>
                  </select>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">标签是否可见</label>
                  <input
                    type="checkbox"
                    checked={data.type === 'point' ? singlePointStyle.showLabel : stationStyle.showLabel}
                    disabled={locked}
                    onChange={(e) => toggleSinglePointLabelControl(id, e.target.checked)}
                    className="w-4 h-4 accent-[#007AFF] cursor-pointer"
                  />
                </div>

                {renderTransformSection()}
              </>
            )}

            {/* RECT / CIRCLE / POLYGON STYLING */}
            {['rectangle', 'circle', 'polygon'].includes(data.type) && (
              <>
                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <Shapes className="w-3.5 h-3.5 text-[#007AFF]" /> 图形与填充样式
                </div>
                {renderColorTrigger('填充颜色', shapeStyle.fillColor, (val) => updateShapeStyle(id, 'fillColor', val))}
                {renderColorTrigger('边框颜色', shapeStyle.borderColor, (val) => updateShapeStyle(id, 'borderColor', val))}
                {renderAnchorGrid(shapeStyle.anchor || 'center', (key, val) => updateShapeStyle(id, key, val))}
                {renderTransformSection()}
              </>
            )}

            {/* IMAGE STYLING */}
            {data.type === 'image' && (
              <>
                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#007AFF]" /> 图片样式设置
                </div>
                {renderColorTrigger('边框颜色', imageStyle.borderColor, (val) => updateImageStyle(id, 'borderColor', val))}
                {renderAnchorGrid(imageStyle.anchor || 'center', (key, val) => updateImageStyle(id, key, val))}
                {renderTransformSection()}
              </>
            )}

            {/* PEN STYLING */}
            {data.type === 'pen' && (
              <>
                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-[#007AFF]" /> 线条绘制样式
                </div>
                {renderColorTrigger('线条颜色', penStyle.color, (val) => updatePenStyle(id, 'color', val))}
                {renderTransformSection()}
              </>
            )}

            {/* TEXT STYLING */}
            {data.type === 'text' && (
              <>
                <div className="text-xs font-semibold text-[#1c1c1e] my-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-[#007AFF]" /> 标注文本内容
                </div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#3c3c43]">文本内容</label>
                  <input
                    type="text"
                    value={data.name || ''}
                    disabled={locked}
                    onChange={(e) => editTextContent(id, e.target.value)}
                    className="w-32 px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
                  />
                </div>

                {renderColorTrigger('文字颜色', textStyle.textColor, (val) => updateTextStyle(id, 'textColor', val))}
                {renderColorTrigger('背景颜色', textStyle.bgColor, (val) => updateTextStyle(id, 'bgColor', val))}
                {renderAnchorGrid(textStyle.anchor || 'center', (key, val) => updateTextStyle(id, key, val))}
                {renderTransformSection()}
              </>
            )}
          </div>
        )}

        {/* Via Stops Tab (Line) */}
        {activeTab === 'stops' && data.type === 'line' && (
          <div className="space-y-2">
            <div className="text-[11px] text-[#8e8e93]">站点继承统一配置，可展开单独定制：</div>
            {data.viaStops && data.viaStops.length > 0 ? (
              data.viaStops.map((stop) => {
                const hasOverride = layer.stopOverrides.has(stop.id);
                const override = layer.stopOverrides.get(stop.id) || {};

                return (
                  <div
                    key={stop.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-2 ${
                      hasOverride ? 'bg-[#007AFF]/5 border-[#007AFF]' : 'bg-white/70 border-black/5'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>
                        {stop.name}{' '}
                        {hasOverride && <span className="text-[#007AFF] text-[10px]">(已自定义)</span>}
                      </span>
                      {hasOverride && (
                        <button
                          className="px-2 py-0.5 text-[10px] rounded bg-red-500 text-white cursor-pointer hover:bg-red-600 flex items-center gap-1"
                          onClick={() => clearStopOverride(id, stop.id)}
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> 重置
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#3c3c43]">自定义名称</label>
                      <input
                        type="text"
                        value={override.labelText !== undefined ? override.labelText : ''}
                        placeholder={stop.name}
                        disabled={locked}
                        onChange={(e) => updateStopOverride(id, stop.id, 'labelText', e.target.value)}
                        className="w-28 px-2 py-0.5 rounded-md border border-[#d1d1d6] text-xs outline-none bg-white"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-[#8e8e93]">暂无途径站点信息</div>
            )}
          </div>
        )}

        {/* Passing Lines Tab (Station/Point) */}
        {activeTab === 'lines' && (data.type === 'station' || data.type === 'point') && (
          <div className="space-y-2">
            {data.buslines && data.buslines.length > 0 ? (
              data.buslines.map((b, idx) => (
                <div key={idx} className="bg-black/2.5 p-2 rounded-lg text-xs flex items-center justify-between">
                  <span className="font-semibold text-[#1c1c1e] truncate max-w-[200px]">{b.name}</span>
                  <button
                    className="px-2 py-1 text-[10px] bg-[#007AFF] text-white rounded cursor-pointer hover:bg-[#0056b3]"
                    onClick={() => addLayerFromSearch({ name: b.name, type: 'line', id: 'bus_' + Date.now() })}
                  >
                    添加线路
                  </button>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-[#8e8e93]">暂无经过线路数据</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
