import React, { useEffect, useRef } from 'react';
import { useMap } from '../context/MapContext';
import { Info, Sparkles, BoxSelect, Copy, Trash2, X, Menu, File, CirclePlus, Bolt, Fullscreen, Maximize } from 'lucide-react';
import { getSavedMapState } from '../services/mapPresets';
import { Tooltip } from './Tooltip';

export const MapCanvas: React.FC = () => {
  const {
    setMapInstance,
    setMouseTool,
    currentMapStyle,
    activeCoreFeatures,
    openedLeftPanel,
    setOpenedLeftPanel,
    isInspectorPanelOpen,
    setIsInspectorPanelOpen,
    isPureMap,
    togglePureMapMode,
    isBoxSelectingNodes,
    nodeSelectMode,
    setNodeSelectMode,
    selectedNodeIndicesSet,
    exitBoxSelectNodesMode,
    deleteSelectedNodes,
    copySelectedNodesToNewLayer,
    calculateSelectedNodesInBox,
    addCustomDrawOverlayToLayer,
    mouseInteractionMode,
    isSpacePressed,
    currentActiveTool,
    selectLayersInBox,
    setFocusedLayerId,
    setMultiSelectedLayerIds,
  } = useMap();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const boxSelectStartPxRef = useRef<{ x: number; y: number } | null>(null);
  const boxSelectEndPxRef = useRef<{ x: number; y: number } | null>(null);

  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const marqueeCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const isMarqueeActiveRef = useRef<boolean>(false);
  const savedMapStateRef = useRef(getSavedMapState());
  const addCustomDrawOverlayRef = useRef(addCustomDrawOverlayToLayer);

  useEffect(() => {
    addCustomDrawOverlayRef.current = addCustomDrawOverlayToLayer;
  }, [addCustomDrawOverlayToLayer]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const windowAMap = (window as any).AMap;
    if (!windowAMap) return;

    let disposed = false;
    let mouseTool: any = null;
    const map = new windowAMap.Map(mapContainerRef.current, {
      zoom: savedMapStateRef.current?.zoom ?? 12,
      center: savedMapStateRef.current?.center ?? [116.397428, 39.90923],
      rotation: savedMapStateRef.current?.rotation ?? 0,
      features: Array.from(activeCoreFeatures),
      viewMode: '2D',
      rotateEnable: true,
      pitchEnable: true,
      mapStyle: currentMapStyle,
    });

    setMapInstance(map);

    const handleDraw = (e: any) => {
      if (disposed) return;
      const overlay = e.obj;
      addCustomDrawOverlayRef.current(overlay);
      try {
        mouseTool?.close(false);
      } catch (err) {
        console.error('Error closing mouseTool after draw:', err);
      }
    };

    windowAMap.plugin(['AMap.MouseTool'], () => {
      if (disposed) return;
      mouseTool = new windowAMap.MouseTool(map);
      setMouseTool(mouseTool);
      mouseTool.on('draw', handleDraw);
    });

    return () => {
      disposed = true;
      if (mouseTool) {
        mouseTool.off?.('draw', handleDraw);
        mouseTool.close?.(false);
      }
      map.destroy();
    };
  }, []);

  // Selection Canvas Resize & Mouse Events
  useEffect(() => {
    const canvas = selectionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseDown = (e: MouseEvent) => {
      if (!isBoxSelectingNodes) return;
      const rect = canvas.getBoundingClientRect();
      boxSelectStartPxRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      boxSelectEndPxRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isBoxSelectingNodes || !boxSelectStartPxRef.current) return;
      const rect = canvas.getBoundingClientRect();
      boxSelectEndPxRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 122, 255, 0.15)';
      ctx.strokeStyle = '#007AFF';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.5;

      const width = boxSelectEndPxRef.current.x - boxSelectStartPxRef.current.x;
      const height = boxSelectEndPxRef.current.y - boxSelectStartPxRef.current.y;
      ctx.fillRect(boxSelectStartPxRef.current.x, boxSelectStartPxRef.current.y, width, height);
      ctx.strokeRect(boxSelectStartPxRef.current.x, boxSelectStartPxRef.current.y, width, height);
    };

    const handleMouseUp = () => {
      if (!isBoxSelectingNodes || !boxSelectStartPxRef.current || !boxSelectEndPxRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const minX = Math.min(boxSelectStartPxRef.current.x, boxSelectEndPxRef.current.x);
      const maxX = Math.max(boxSelectStartPxRef.current.x, boxSelectEndPxRef.current.x);
      const minY = Math.min(boxSelectStartPxRef.current.y, boxSelectEndPxRef.current.y);
      const maxY = Math.max(boxSelectStartPxRef.current.y, boxSelectEndPxRef.current.y);

      const canvasRect = canvas.getBoundingClientRect();
      calculateSelectedNodesInBox(
        minX + canvasRect.left,
        maxX + canvasRect.left,
        minY + canvasRect.top,
        maxY + canvasRect.top
      );

      boxSelectStartPxRef.current = null;
      boxSelectEndPxRef.current = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isBoxSelectingNodes, calculateSelectedNodesInBox]);

  // Layer Marquee Box Selection Effect (Select Mode)
  useEffect(() => {
    const mapDiv = mapContainerRef.current;
    const canvas = selectionCanvasRef.current;
    if (!mapDiv || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseDown = (e: MouseEvent) => {
      // ✅ 新增：如果事件已经被 AMap 的图层元素处理并标记，则直接跳过，绝不生成选框！
      if ((e as any)._isOverlayTarget) {
        return;
      }

      if (
        mouseInteractionMode !== 'select' ||
        isSpacePressed ||
        currentActiveTool !== null ||
        isBoxSelectingNodes ||
        e.button !== 0
      ) {
        return;
      }

      const target = e.target as HTMLElement;
      if (!target) return;

      const eventPath = e.composedPath ? e.composedPath() : [target];
      const pathElements = eventPath.filter((node): node is Element => node instanceof Element);

      // Ignore UI buttons, controls
      if (pathElements.some((element) =>
        element.matches('button, .amap-controls, .amap-ui-control') ||
        Boolean(element.closest('button, .amap-controls, .amap-ui-control'))
      )) {
        return;
      }

      // Ignore layer overlay elements (markers, vector shapes, text/image nodes, handles, etc.)
      const isVectorGraphic = pathElements.some((element) =>
        ['path', 'polygon', 'polyline', 'rect', 'circle', 'ellipse', 'g', 'svg'].includes(
          element.tagName.toLowerCase()
        )
      );

      const isOverlayDOM = pathElements.some((element) =>
        Boolean(
          element.closest(
            '.amap-overlay-container, .amap-marker, .amap-markers, .amap-editor, .amap-icon, [data-layer-id]'
          )
        )
      );

      if (isVectorGraphic || isOverlayDOM) {
        return;
      }

      const rect = mapDiv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      marqueeStartRef.current = { x, y };
      marqueeCurrentRef.current = { x, y };
      isMarqueeActiveRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!marqueeStartRef.current) return;

      const rect = mapDiv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      marqueeCurrentRef.current = { x, y };

      const dx = Math.abs(x - marqueeStartRef.current.x);
      const dy = Math.abs(y - marqueeStartRef.current.y);

      if (dx > 4 || dy > 4) {
        isMarqueeActiveRef.current = true;
      }

      if (isMarqueeActiveRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 122, 255, 0.12)';
        ctx.strokeStyle = '#007AFF';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;

        const startX = marqueeStartRef.current.x;
        const startY = marqueeStartRef.current.y;
        const w = x - startX;
        const h = y - startY;

        ctx.fillRect(startX, startY, w, h);
        ctx.strokeRect(startX, startY, w, h);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!marqueeStartRef.current) return;

      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isMarqueeActiveRef.current && marqueeCurrentRef.current) {
        const startX = marqueeStartRef.current.x;
        const startY = marqueeStartRef.current.y;
        const endX = marqueeCurrentRef.current.x;
        const endY = marqueeCurrentRef.current.y;

        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        selectLayersInBox(minX, maxX, minY, maxY, e.shiftKey);
      } else if (!e.shiftKey) {
        // A click that started on empty map space clears the current selection.
        setFocusedLayerId(null);
        setMultiSelectedLayerIds(new Set());
      }

      marqueeStartRef.current = null;
      marqueeCurrentRef.current = null;
      isMarqueeActiveRef.current = false;
    };

    mapDiv.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      mapDiv.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    mouseInteractionMode,
    isSpacePressed,
    currentActiveTool,
    isBoxSelectingNodes,
    selectLayersInBox,
    setFocusedLayerId,
    setMultiSelectedLayerIds,
  ]);

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden">
      {/* Map Container */}
      <div id="map-container" ref={mapContainerRef} className="w-full h-full absolute top-0 left-0 z-1" />

      {/* Selection Overlay Canvas */}
      <canvas
        ref={selectionCanvasRef}
        className={`absolute top-0 left-0 w-full h-full z-10 ${isBoxSelectingNodes ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
          }`}
      />

      {/* Floating Map Corner Buttons */}
      {!isPureMap && (
        <>
          {/* 左边栏   */}
          <aside className="w-[55px] absolute top-0 left-0 z-35 bg-white h-full flex flex-col justify-start items-center gap-y-2 py-2.5 border-r border-r-[#ddd]">

            <Tooltip content="主菜单" placement="right">
              <button className="w-10 h-10 rounded-lg hover:bg-black/5 text-[#8e8e93] flex items-center justify-center text-xs cursor-pointer">
                <Menu className="w-4 h-4" />
              </button>
            </Tooltip>

            <div className="w-8 h-[1px] bg-black/10"></div>

            <div className="flex-1 flex flex-col gap-2">
              <Tooltip content="文件 ⌥ 1" placement="right">
                <button
                  className={`group w-10 cursor-pointer flex flex-col items-center justify-center ${openedLeftPanel === 'file' ? 'text-[#007AFF]' : 'text-black/80'}`}
                  onClick={() => setOpenedLeftPanel(openedLeftPanel === 'file' ? null : 'file')}
                >
                  <div className={`w-8 h-8 flex items-center justify-center ${openedLeftPanel === 'file' ? 'bg-[#007AFF]/10' : 'group-hover:bg-black/5'} rounded-lg`}>
                    <File className="w-4 h-4" />
                  </div>
                  <span className="text-xs">文件</span>
                </button>
              </Tooltip>

              <Tooltip content="资源 ⌥ 2" placement="right">
                <button
                  className={`group w-10 cursor-pointer flex flex-col items-center justify-center ${openedLeftPanel === 'asset' ? 'text-[#007AFF]' : 'text-black/80'}`}
                  onClick={() => setOpenedLeftPanel(openedLeftPanel === 'asset' ? null : 'asset')}
                >
                  <div className={`w-8 h-8 flex items-center justify-center ${openedLeftPanel === 'asset' ? 'bg-[#007AFF]/10' : 'group-hover:bg-black/5'} rounded-lg`}>
                    <CirclePlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs">资源</span>
                </button>
              </Tooltip>
            </div>

            <div className="w-8 h-[1px] bg-black/10"></div>

            <Tooltip content="全屏 ⌥ F" placement="right">
              <button
                className={`group w-10 cursor-pointer flex flex-col items-center justify-center text-black/80`}
                onClick={() => togglePureMapMode()}
              >
                <div className={`w-8 h-8 flex items-center justify-center group-hover:bg-black/5 rounded-lg`}>
                  <Maximize className="w-4 h-4" />
                </div>
              </button>
            </Tooltip>

            <Tooltip content="设置 ⌥ ," placement="right">
              <button
                className={`group w-10 cursor-pointer flex flex-col items-center justify-center ${openedLeftPanel === 'setting' ? 'text-[#007AFF]' : 'text-black/80'}`}
                onClick={() => setOpenedLeftPanel(openedLeftPanel === 'setting' ? null : 'setting')}
              >
                <div className={`w-8 h-8 flex items-center justify-center ${openedLeftPanel === 'setting' ? 'bg-[#007AFF]/10' : 'group-hover:bg-black/5'} rounded-lg`}>
                  <Bolt className="w-4 h-4" />
                </div>
              </button>
            </Tooltip>

            <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-sm font-bold">A</div>
          </aside>

          <button
            className={`absolute top-4 right-4 z-15 h-9 px-3.5 rounded-xl backdrop-blur-xl border cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-all hover:-translate-y-0.5 ${isInspectorPanelOpen
              ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-lg shadow-[#007AFF]/25'
              : 'bg-white/90 text-[#1c1c1e] border-white/80 shadow-lg hover:bg-white hover:text-[#007AFF]'
              }`}
            onClick={() => setIsInspectorPanelOpen(!isInspectorPanelOpen)}
          >
            <Info className="w-4 h-4" /> 检查器
          </button>
        </>
      )}

      {/* Zen Mode Toast */}
      {isPureMap && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xl text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl z-[10000] flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-emerald-400" /> 已开启禅模式，按 ESC 键退出
        </div>
      )}

      {/* Batch Nodes Toolbar */}
      {isBoxSelectingNodes && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-xl px-4 py-2 shadow-2xl border border-white/80 z-[1000] flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <BoxSelect className="w-4 h-4 text-[#007AFF]" /> 已选{' '}
            <strong className="text-[#007AFF]">{selectedNodeIndicesSet.size}</strong> 个脊线节点
          </span>

          <div className="w-[1px] h-3.5 bg-black/12" />

          <div className="flex gap-1 bg-black/5 p-0.5 rounded-lg">
            {(['replace', 'add', 'subtract'] as const).map((mode) => (
              <button
                key={mode}
                className={`px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer ${nodeSelectMode === mode ? 'bg-[#007AFF] text-white font-semibold' : 'text-[#333]'
                  }`}
                onClick={() => setNodeSelectMode(mode)}
              >
                {mode === 'replace' ? '替换' : mode === 'add' ? '增加' : '减去'}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-3.5 bg-black/12" />

          <button
            className="px-2 py-1 text-[11px] rounded-md bg-[#007AFF] text-white hover:bg-[#0056b3] transition-colors flex items-center gap-1 cursor-pointer"
            onClick={copySelectedNodesToNewLayer}
          >
            <Copy className="w-3 h-3" /> 复制为新钢笔图层
          </button>

          <button
            className="px-2 py-1 text-[11px] rounded-md bg-[#ff3b30] text-white hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            onClick={deleteSelectedNodes}
          >
            <Trash2 className="w-3 h-3" /> 删除节点
          </button>

          <button
            className="w-6 h-6 rounded-md hover:bg-black/10 text-[#8e8e93] flex items-center justify-center text-xs cursor-pointer"
            onClick={exitBoxSelectNodesMode}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
