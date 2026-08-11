import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import {
  LayerType,
  LayerItemData,
  LayerObject,
  FolderObject,
  GlobalTextConfig,
  CustomFont,
  CopiedStyleData,
  DrawToolType,
  StopOverride,
  StationStyle,
  SinglePointStyle,
  ShapeStyle,
  ImageStyle,
  PenStyle,
  TextStyle,
  LayerStyle,
} from '../types';
import {
  getSavedMapState,
  persistMapState as saveMapStateToStorage,
  BUILTIN_PRESETS,
  getCustomPresets,
  saveCustomPreset as saveCustomPresetToStorage,
  deleteCustomPreset as deleteCustomPresetToStorage,
} from '../services/mapPresets';
import { getStoredFonts, saveFontToDB, deleteFontFromDB, registerFontFace } from '../services/indexedDB';
import { buildStationIconSvg, createCustomIcon, getAnchorByOffsetDir } from '../utils/svgHelpers';

interface MapContextType {
  mapInstance: any;
  setMapInstance: (map: any) => void;
  mouseTool: any;
  setMouseTool: (tool: any) => void;

  layerTree: string[];
  setLayerTree: React.Dispatch<React.SetStateAction<string[]>>;
  folderMap: Map<string, FolderObject>;
  layerMap: Map<string, LayerObject>;

  focusedLayerId: string | null;
  setFocusedLayerId: (id: string | null) => void;
  multiSelectedLayerIds: Set<string>;
  setMultiSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  rightClickedLayerId: string | null;
  setRightClickedLayerId: (id: string | null) => void;
  copiedStyleData: CopiedStyleData | null;

  globalTextConfig: GlobalTextConfig;
  setGlobalTextConfig: React.Dispatch<React.SetStateAction<GlobalTextConfig>>;
  updateGlobalTextConfig: (key: keyof GlobalTextConfig, val: any) => void;

  customFonts: CustomFont[];
  addCustomFont: (file: File) => Promise<void>;
  removeCustomFont: (name: string) => Promise<void>;

  currentCity: string;
  setCurrentCity: (city: string) => void;
  selectCity: (city: string) => void;

  currentMapStyle: string;
  applyMapTheme: (styleUrl: string) => void;

  activeCoreFeatures: Set<string>;
  toggleFeatureGroup: (key: string, enabled: boolean) => void;
  applyPreset: (presetKey: string) => void;
  customPresets: Record<string, { name: string; features: string[] }>;
  saveNewPreset: (name: string) => void;
  deletePreset: (key: string) => void;

  currentActiveTool: DrawToolType;
  activateDrawTool: (tool: DrawToolType) => void;
  deactivateDrawTools: () => void;
  mouseInteractionMode: 'select' | 'pan';
  setMouseInteractionMode: (mode: 'select' | 'pan') => void;
  isSpacePressed: boolean;
  selectLayersInBox: (minX: number, maxX: number, minY: number, maxY: number, isShiftPressed: boolean) => void;
  pendingUploadedImageUrl: string | null;
  setPendingUploadedImageUrl: (url: string | null) => void;

  isPureMap: boolean;
  togglePureMapMode: () => void;

  // Panel Toggles
  isCityPanelOpen: boolean;
  setIsCityPanelOpen: (open: boolean) => void;
  isSearchPanelOpen: boolean;
  setIsSearchPanelOpen: (open: boolean) => void;
  isLayerPanelOpen: boolean;
  setIsLayerPanelOpen: (open: boolean) => void;
  isInspectorPanelOpen: boolean;
  setIsInspectorPanelOpen: (open: boolean) => void;
  isStylePanelOpen: boolean;
  setIsStylePanelOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  // Context Menu
  contextMenuPos: { x: number; y: number } | null;
  setContextMenuPos: (pos: { x: number; y: number } | null) => void;

  // History Stack
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;

  // Layer Operations
  addLayerFromSearch: (item: LayerItemData) => void;
  addLayerToMap: (item: LayerItemData, flash?: boolean) => void;
  removeLayerFromMap: (id: string) => void;
  selectLayer: (id: string, event?: any) => void;
  toggleLayerVisibility: (id: string, e?: any) => void;
  toggleLayerLock: (id: string, e?: any) => void;
  updateStyle: (id: string, key: string, value: any) => void;
  updateShapeStyle: (id: string, key: string, value: any) => void;
  updateImageStyle: (id: string, key: string, value: any) => void;
  updatePenStyle: (id: string, key: string, value: any) => void;
  updateTextStyle: (id: string, key: string, value: any) => void;
  updateStationStyle: (id: string, key: string, value: any) => void;
  updateSinglePointStyle: (id: string, key: string, value: any) => void;
  updateLayerTransform: (id: string, key: 'rotation' | 'flipX' | 'flipY', value: any) => void;
  toggleUniversalEditing: (id: string) => void;
  toggleStationsControl: (id: string, key: string, checked: boolean) => void;
  updateStopOverride: (id: string, stopId: string, key: string, value: any) => void;
  clearStopOverride: (id: string, stopId: string) => void;
  toggleSinglePointLabelControl: (id: string, checked: boolean) => void;
  editTextContent: (id: string, newText: string) => void;
  renderStationElements: (id: string) => void;
  renderSinglePointLayer: (id: string) => void;
  renderTextLayer: (id: string) => void;
  renderImageLayer: (id: string) => void;
  copyLayerStyle: () => void;
  pasteLayerStyle: () => void;

  // Folder Operations
  createNewFolder: (parentFolderId?: string | null) => void;
  toggleFolderCollapse: (folderId: string, event?: any) => void;
  toggleFolderVisibility: (folderId: string, event?: any) => void;
  deleteFolder: (folderId: string) => void;
  groupSelectedLayers: () => void;
  alignSelectedLayers: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') => void;

  // Node Selection Mode for Line/Pen
  isBoxSelectingNodes: boolean;
  nodeSelectMode: 'replace' | 'add' | 'subtract';
  setNodeSelectMode: (mode: 'replace' | 'add' | 'subtract') => void;
  selectedNodeIndicesSet: Set<number>;
  startBoxSelectNodesMode: () => void;
  exitBoxSelectNodesMode: () => void;
  deleteSelectedNodes: () => void;
  copySelectedNodesToNewLayer: () => void;
  calculateSelectedNodesInBox: (minX: number, maxX: number, minY: number, maxY: number) => void;

  // DevTools Color Picker State
  activeColorPickerTarget: {
    currentColor: string;
    callback: (color: string) => void;
    triggerElem: HTMLElement;
  } | null;
  openDevToolsColorPicker: (triggerElem: HTMLElement, currentColor: string, callback: (color: string) => void) => void;
  closeDevToolsColorPicker: () => void;

  addCustomDrawOverlayToLayer: (overlay: any, toolTypeOverride?: DrawToolType) => void;

  // Import / Export
  exportJSONData: (filename?: string) => void;
  importJSONData: (importedData: any) => void;

  // Helper trigger re-renders for maps/layers
  forceUpdateLayers: () => void;
}

const MapContext = createContext<MapContextType | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}

const MAX_HISTORY_SIZE = 30;

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mouseTool, setMouseTool] = useState<any>(null);

  const [layerTree, setLayerTree] = useState<string[]>([]);
  const folderMapRef = useRef<Map<string, FolderObject>>(new Map());
  const layerMapRef = useRef<Map<string, LayerObject>>(new Map());

  const [focusedLayerId, setFocusedLayerId] = useState<string | null>(null);
  const [multiSelectedLayerIds, setMultiSelectedLayerIds] = useState<Set<string>>(new Set());
  const [rightClickedLayerId, setRightClickedLayerId] = useState<string | null>(null);
  const [copiedStyleData, setCopiedStyleData] = useState<CopiedStyleData | null>(null);

  // Persistence State
  const savedState = getSavedMapState();
  const [globalTextConfig, setGlobalTextConfig] = useState<GlobalTextConfig>(
    savedState?.globalTextConfig || {
      fontFamily: '-apple-system, sans-serif',
      fontSize: 12,
      fontWeight: '600',
    }
  );
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [currentCity, setCurrentCity] = useState<string>('全国');
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(savedState?.mapStyle || 'amap://styles/normal');
  const [activeCoreFeatures, setActiveCoreFeatures] = useState<Set<string>>(
    new Set(savedState?.activeCoreFeatures || ['bg', 'road', 'point', 'building'])
  );
  const [customPresets, setCustomPresetsState] = useState<Record<string, { name: string; features: string[] }>>({});

  const currentActiveToolRef = useRef<DrawToolType>(null);
  const [currentActiveTool, setCurrentActiveToolState] = useState<DrawToolType>(null);
  const setCurrentActiveTool = (tool: DrawToolType) => {
    currentActiveToolRef.current = tool;
    setCurrentActiveToolState(tool);
  };

  const pendingUploadedImageUrlRef = useRef<string | null>(null);
  const [pendingUploadedImageUrl, setPendingUploadedImageUrlState] = useState<string | null>(null);
  const setPendingUploadedImageUrl = (url: string | null) => {
    pendingUploadedImageUrlRef.current = url;
    setPendingUploadedImageUrlState(url);
  };

  const [isPureMap, setIsPureMap] = useState<boolean>(false);

  // Mouse Mode & Spacebar Panning State
  const [mouseInteractionMode, setMouseInteractionMode] = useState<'select' | 'pan'>('select');
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  const mouseInteractionModeRef = useRef(mouseInteractionMode);
  const isSpacePressedRef = useRef(isSpacePressed);
  useEffect(() => {
    mouseInteractionModeRef.current = mouseInteractionMode;
    isSpacePressedRef.current = isSpacePressed;
    currentActiveToolRef.current = currentActiveTool;
  }, [mouseInteractionMode, isSpacePressed, currentActiveTool]);

  const attachVectorDragListeners = (layerObj: LayerObject) => {
    const overlay = layerObj.overlay;
    if (!overlay || !overlay.on || (overlay as any)._hasVectorDragListener) return;

    // Keep vector geometry in application state in sync with AMap's native
    // dragging, just as Marker does for image and text layers.
    if (!['line', 'pen', 'rectangle', 'circle', 'polygon'].includes(layerObj.data.type)) return;
    (overlay as any)._hasVectorDragListener = true;

    overlay.on('dragend', () => {
      if (layerObj.locked) return;
      if (overlay.getPath) {
        const path = overlay.getPath();
        if (path) layerObj.data.path = path.map((point: any) => [point.lng, point.lat]);
      }
      if (overlay.getCenter) {
        const center = overlay.getCenter();
        if (center) layerObj.data.location = [center.lng, center.lat];
      }
      pushSnapshot();
      forceUpdateLayers();
    });
  };

  // Space key listener for temporary pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        const isInput =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          setIsSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Control AMap dragEnable & cursor based on mode and Space key
  useEffect(() => {
    if (!mapInstance) return;
    const isPanMode = mouseInteractionMode === 'pan' || isSpacePressed;
    const setDefaultCursorGrab = () => mapInstance.setDefaultCursor('grab');
    const setDefaultCursorGrabbing = () => mapInstance.setDefaultCursor('grabbing');
    const setDefaultCursorDefault = () => mapInstance.setDefaultCursor('default');
    const setDefaultCursorCrosshair = () => mapInstance.setDefaultCursor('crosshair');
    try {
      mapInstance.setStatus({ dragEnable: isPanMode });
      if (isPanMode) {
        setDefaultCursorGrab();
        mapInstance.on('dragging', setDefaultCursorGrabbing);
        mapInstance.on('dragend', setDefaultCursorGrab);
      } else {
        if (currentActiveToolRef.current) {
          switch (currentActiveToolRef.current) {
            case 'rectangle':
            case 'circle':
            case 'polygon':
            case 'image':
            case 'pen':
            case 'text':
              setDefaultCursorCrosshair();
              break;
            default:
              setDefaultCursorDefault();
              break;
          }
        } else {
          setDefaultCursorDefault();
        }
      }

      layerMapRef.current.forEach((layer) => {
        applyLayerDraggableStateInternal(layer);
      });
    } catch (e) {
      console.error('Error updating map drag status:', e);
    }
    return () => {
      mapInstance.off('dragging', setDefaultCursorGrabbing);
      mapInstance.off('dragend', setDefaultCursorGrab);
    }
  }, [mapInstance, mouseInteractionMode, isSpacePressed, currentActiveTool]);

  // Panels visibility
  const [isCityPanelOpen, setIsCityPanelOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);
  const [isInspectorPanelOpen, setIsInspectorPanelOpen] = useState(false);
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Force re-render helper
  const [, setTick] = useState(0);
  const forceUpdateLayers = () => setTick((t) => t + 1);

  // Color picker popover state
  const [activeColorPickerTarget, setActiveColorPickerTarget] = useState<{
    currentColor: string;
    callback: (color: string) => void;
    triggerElem: HTMLElement;
  } | null>(null);

  // Global ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        deactivateDrawTools();
        setActiveColorPickerTarget(null);
        exitBoxSelectNodesMode();
        setIsPureMap(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Node Selection mode
  const [isBoxSelectingNodes, setIsBoxSelectingNodes] = useState(false);
  const [nodeSelectMode, setNodeSelectMode] = useState<'replace' | 'add' | 'subtract'>('replace');
  const selectedNodeIndicesSetRef = useRef<Set<number>>(new Set());
  const tempNodeMarkersRef = useRef<any[]>([]);

  // History Stack
  const historyStackRef = useRef<any[]>([]);
  const historyPointerRef = useRef<number>(-1);
  const isWorkingRef = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = () => {
    setCanUndo(historyPointerRef.current > 0);
    setCanRedo(historyPointerRef.current < historyStackRef.current.length - 1);
  };

  const pushSnapshot = () => {
    if (isWorkingRef.current) return;

    const snapshot = {
      layerTree: JSON.parse(JSON.stringify(layerTree)),
      folders: Array.from(folderMapRef.current.entries()).map(([fId, fObj]) => [fId, JSON.parse(JSON.stringify(fObj))]),
      layers: Array.from(layerMapRef.current.entries()).map(([id, layer]) => {
        let overlayPath = null;
        let overlayCenter = null;
        let overlayRadius = null;
        let position = null;

        if (layer.overlay.getPath) {
          const p = layer.overlay.getPath();
          overlayPath = p ? p.map((pt: any) => [pt.lng, pt.lat]) : null;
        }
        if (layer.overlay.getCenter) {
          const c = layer.overlay.getCenter();
          overlayCenter = c ? [c.lng, c.lat] : null;
        }
        if (layer.overlay.getRadius) {
          overlayRadius = layer.overlay.getRadius();
        }
        if (layer.overlay.getPosition) {
          const pos = layer.overlay.getPosition();
          position = pos ? [pos.lng, pos.lat] : null;
        }

        return {
          id,
          data: JSON.parse(JSON.stringify(layer.data)),
          style: JSON.parse(JSON.stringify(layer.style)),
          stationStyle: JSON.parse(JSON.stringify(layer.stationStyle)),
          singlePointStyle: JSON.parse(JSON.stringify(layer.singlePointStyle)),
          shapeStyle: JSON.parse(JSON.stringify(layer.shapeStyle)),
          imageStyle: JSON.parse(JSON.stringify(layer.imageStyle)),
          penStyle: JSON.parse(JSON.stringify(layer.penStyle)),
          textStyle: JSON.parse(JSON.stringify(layer.textStyle)),
          stopOverrides: Array.from(layer.stopOverrides.entries()),
          rotation: layer.rotation || 0,
          flipX: !!layer.flipX,
          flipY: !!layer.flipY,
          visible: layer.visible,
          locked: layer.locked,
          overlayPath,
          overlayCenter,
          overlayRadius,
          position,
        };
      }),
    };

    if (historyPointerRef.current < historyStackRef.current.length - 1) {
      historyStackRef.current = historyStackRef.current.slice(0, historyPointerRef.current + 1);
    }

    historyStackRef.current.push(snapshot);
    if (historyStackRef.current.length > MAX_HISTORY_SIZE) {
      historyStackRef.current.shift();
    } else {
      historyPointerRef.current++;
    }

    updateHistoryState();
  };

  const restoreSnapshot = (snapshot: any) => {
    if (!mapInstance) return;
    isWorkingRef.current = true;

    // Clear existing overlays
    layerMapRef.current.forEach((layer) => {
      if (layer.labelMarkers) mapInstance.remove(layer.labelMarkers);
      if (layer.stationMarkers) mapInstance.remove(layer.stationMarkers);
      if (layer.endpointMarkers) mapInstance.remove(layer.endpointMarkers);
      mapInstance.remove(layer.overlay);
    });

    layerMapRef.current.clear();
    folderMapRef.current.clear();

    snapshot.folders.forEach(([fId, fObj]: [string, any]) => {
      folderMapRef.current.set(fId, JSON.parse(JSON.stringify(fObj)));
    });
    setLayerTree(JSON.parse(JSON.stringify(snapshot.layerTree)));

    snapshot.layers.forEach((item: any) => {
      if (item.overlayPath) item.data.path = item.overlayPath;
      if (item.position) item.data.location = item.position;
      if (item.overlayRadius !== null && item.overlayRadius !== undefined) item.data.radius = item.overlayRadius;

      addLayerToMapInternal(item.data, false);
      const layer = layerMapRef.current.get(item.id);
      if (layer) {
        if (item.style) layer.style = JSON.parse(JSON.stringify(item.style));
        if (item.stationStyle) layer.stationStyle = JSON.parse(JSON.stringify(item.stationStyle));
        if (item.singlePointStyle) layer.singlePointStyle = JSON.parse(JSON.stringify(item.singlePointStyle));
        if (item.shapeStyle) layer.shapeStyle = JSON.parse(JSON.stringify(item.shapeStyle));
        if (item.imageStyle) layer.imageStyle = JSON.parse(JSON.stringify(item.imageStyle));
        if (item.penStyle) layer.penStyle = JSON.parse(JSON.stringify(item.penStyle));
        if (item.textStyle) layer.textStyle = JSON.parse(JSON.stringify(item.textStyle));
        if (item.stopOverrides) layer.stopOverrides = new Map(JSON.parse(JSON.stringify(item.stopOverrides)));
        layer.rotation = item.rotation || 0;
        layer.flipX = !!item.flipX;
        layer.flipY = !!item.flipY;
        layer.visible = item.visible;
        layer.locked = item.locked;

        if (item.overlayPath && layer.overlay.setPath) layer.overlay.setPath(item.overlayPath);
        if (item.overlayCenter && layer.overlay.setCenter) layer.overlay.setCenter(item.overlayCenter);
        if (item.overlayRadius && layer.overlay.setRadius) layer.overlay.setRadius(item.overlayRadius);
        if (item.position && layer.overlay.setPosition) layer.overlay.setPosition(item.position);

        if (item.data.type === 'station' || item.data.type === 'point') renderSinglePointLayerInternal(item.id);
        else if (item.data.type === 'line') renderStationElementsInternal(item.id);
        else if (item.data.type === 'image') renderImageLayerInternal(item.id);
        else if (item.data.type === 'text') renderTextLayerInternal(item.id);

        const visibilityMethod = layer.visible ? 'show' : 'hide';
        layer.overlay[visibilityMethod]?.();
        layer.labelMarkers?.forEach((marker) => marker[visibilityMethod]?.());
        layer.stationMarkers?.forEach((marker) => marker[visibilityMethod]?.());
        layer.endpointMarkers?.forEach((marker) => marker[visibilityMethod]?.());

        applyLayerTransformsInternal(layer);
      }
    });

    isWorkingRef.current = false;
    forceUpdateLayers();
  };

  const undo = () => {
    if (historyPointerRef.current > 0) {
      historyPointerRef.current--;
      restoreSnapshot(historyStackRef.current[historyPointerRef.current]);
      updateHistoryState();
    }
  };

  const redo = () => {
    if (historyPointerRef.current < historyStackRef.current.length - 1) {
      historyPointerRef.current++;
      restoreSnapshot(historyStackRef.current[historyPointerRef.current]);
      updateHistoryState();
    }
  };

  // Load custom fonts & presets on mount
  useEffect(() => {
    getStoredFonts().then((fonts) => {
      fonts.forEach((f) => registerFontFace(f.name, f.dataUrl));
      setCustomFonts(fonts);
    });
    setCustomPresetsState(getCustomPresets());
  }, []);

  // Save state helper
  const persistState = (overrides: Partial<{ mapStyle: string; activeCoreFeatures: string[] }> = {}) => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    saveMapStateToStorage({
      center: [center.lng, center.lat],
      zoom: mapInstance.getZoom(),
      rotation: mapInstance.getRotation(),
      mapStyle: overrides.mapStyle ?? currentMapStyle,
      globalTextConfig,
      activeCoreFeatures: overrides.activeCoreFeatures ?? Array.from(activeCoreFeatures),
    });
  };

  const openDevToolsColorPicker = (
    triggerElem: HTMLElement,
    currentColor: string,
    callback: (color: string) => void
  ) => {
    setActiveColorPickerTarget({ triggerElem, currentColor, callback });
  };

  const closeDevToolsColorPicker = () => {
    setActiveColorPickerTarget(null);
  };

  // Map Feature & Theme Controls
  const applyMapTheme = (styleUrl: string) => {
    setCurrentMapStyle(styleUrl);
    if (mapInstance) mapInstance.setMapStyle(styleUrl);
    persistState({ mapStyle: styleUrl });
  };

  const toggleFeatureGroup = (key: string, enabled: boolean) => {
    const updated = new Set<string>(activeCoreFeatures);
    if (enabled) updated.add(key);
    else updated.delete(key);
    setActiveCoreFeatures(updated);
    if (mapInstance) mapInstance.setFeatures(Array.from(updated));
    persistState({ activeCoreFeatures: Array.from(updated) });
  };

  const applyPreset = (presetKey: string) => {
    let features: string[] = [];
    if (BUILTIN_PRESETS[presetKey]) {
      features = BUILTIN_PRESETS[presetKey];
    } else {
      const presets = getCustomPresets();
      if (presets[presetKey]) features = presets[presetKey].features;
    }
    const updated = new Set(features);
    setActiveCoreFeatures(updated);
    if (mapInstance) mapInstance.setFeatures(features);
    persistState({ activeCoreFeatures: Array.from(updated) });
  };

  const saveNewPreset = (name: string) => {
    if (!name.trim()) return;
    const key = 'custom_' + Date.now();
    const preset = { name: name.trim(), features: Array.from(activeCoreFeatures) as string[] };
    saveCustomPresetToStorage(key, preset);
    setCustomPresetsState(getCustomPresets());
  };

  const deletePreset = (key: string) => {
    deleteCustomPresetToStorage(key);
    setCustomPresetsState(getCustomPresets());
    applyPreset('default');
  };

  // Global Text Config Update
  const updateGlobalTextConfig = (key: keyof GlobalTextConfig, val: any) => {
    setGlobalTextConfig((prev) => {
      const next = { ...prev, [key]: val };
      layerMapRef.current.forEach((layer, id) => {
        if (layer.stationStyle) (layer.stationStyle as any)[key] = val;
        if (layer.singlePointStyle) (layer.singlePointStyle as any)[key] = val;
        if (layer.textStyle) (layer.textStyle as any)[key] = val;

        if (layer.data.type === 'station' || layer.data.type === 'point') renderSinglePointLayerInternal(id);
        else if (layer.data.type === 'line') renderStationElementsInternal(id);
        else if (layer.data.type === 'text') renderTextLayerInternal(id);
      });
      pushSnapshot();
      forceUpdateLayers();
      return next;
    });
  };

  // Font Upload & Delete
  const addCustomFont = async (file: File) => {
    const name = file.name.split('.')[0].replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '');
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const fontObj = { name, dataUrl };
        await registerFontFace(name, dataUrl);
        await saveFontToDB(fontObj);
        setCustomFonts((prev) => [...prev.filter((f) => f.name !== name), fontObj]);
        refreshLabelsFont();
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCustomFont = async (name: string) => {
    await deleteFontFromDB(name);
    setCustomFonts((prev) => prev.filter((f) => f.name !== name));
    refreshLabelsFont();
  };

  const refreshLabelsFont = () => {
    layerMapRef.current.forEach((layer, id) => {
      if (layer.data.type === 'line') renderStationElementsInternal(id);
      else if (layer.data.type === 'station' || layer.data.type === 'point') renderSinglePointLayerInternal(id);
      else if (layer.data.type === 'text') renderTextLayerInternal(id);
    });
    forceUpdateLayers();
  };

  const selectCity = (cityName: string) => {
    setCurrentCity(cityName);
    setIsCityPanelOpen(false);
  };

  const togglePureMapMode = () => {
    setIsPureMap((prev) => !prev);
  };

  // Drawing Tools Activation
  const activateDrawTool = (toolType: DrawToolType) => {
    if (!mouseTool) return;

    if (currentActiveTool === toolType) {
      deactivateDrawTools();
      return;
    }

    deactivateDrawTools();
    setCurrentActiveTool(toolType);

    setMouseInteractionMode('select');

    switch (toolType) {
      case 'rectangle':
        mouseTool.rectangle({ strokeColor: '#007AFF', strokeWeight: 2, fillColor: '#007AFF', fillOpacity: 0.3 });
        break;
      case 'circle':
        mouseTool.circle({ strokeColor: '#007AFF', strokeWeight: 2, fillColor: '#007AFF', fillOpacity: 0.3 });
        break;
      case 'polygon':
        mouseTool.polygon({ strokeColor: '#007AFF', strokeWeight: 2, fillColor: '#007AFF', fillOpacity: 0.3 });
        break;
      case 'image':
        const fileInput = document.getElementById('map-image-upload-input');
        if (fileInput) fileInput.click();
        break;
      case 'pen':
        mouseTool.polyline({ strokeColor: '#007AFF', strokeWeight: 4 });
        break;
      case 'text':
        mouseTool.marker({ icon: createCustomIcon('#007AFF'), anchor: 'center' });
        break;
    }
  };

  const deactivateDrawTools = () => {
    if (mouseTool) {
      try {
        mouseTool.close(false);
      } catch (e) {
        console.error(e);
      }
    }
    setCurrentActiveTool(null);
  };

  // Global Keyboard Shortcuts (V: Select, W: Pan, R: Rectangle, O: Circle, Shift+Cmd/Ctrl+K: Image, P: Pen, T: Text)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Shift + Cmd/Ctrl + K -> Image marker tool
      if (e.shiftKey && isCmdOrCtrl && key === 'k') {
        e.preventDefault();
        activateDrawTool('image');
        return;
      }

      // Do not hijack browser/system shortcuts (Cmd+R, Cmd+P, Cmd+T, Cmd+W, etc.)
      if (isCmdOrCtrl || e.altKey) {
        return;
      }

      switch (key) {
        case 'v':
          e.preventDefault();
          deactivateDrawTools();
          setMouseInteractionMode('select');
          break;
        case 'w':
          e.preventDefault();
          deactivateDrawTools();
          setMouseInteractionMode('pan');
          break;
        case 'r':
          e.preventDefault();
          activateDrawTool('rectangle');
          break;
        case 'o':
          e.preventDefault();
          activateDrawTool('circle');
          break;
        case 'p':
          e.preventDefault();
          activateDrawTool('pen');
          break;
        case 't':
          e.preventDefault();
          activateDrawTool('text');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activateDrawTool, deactivateDrawTools]);

  // Layer Operations & Rendering Internal Helpers
  const applyLayerTransformsInternal = (layer: LayerObject) => {
    if (!layer || !layer.overlay) return;

    const rot = layer.rotation || 0;
    const fx = layer.flipX ? -1 : 1;
    const fy = layer.flipY ? -1 : 1;

    // Use native setAngle on AMap.Marker if available
    if (layer.overlay.setAngle) {
      layer.overlay.setAngle(rot);
    }

    const element = layer.overlay.getElement ? layer.overlay.getElement() : null;
    if (element) {
      // Target inner child element to avoid overwriting outer AMap translate3d(x, y) positioning
      const targetChild = (element.firstElementChild as HTMLElement) || element;
      targetChild.style.transformOrigin = 'center center';
      (targetChild.style as any).transformBox = 'fill-box';

      const rotateCss = !layer.overlay.setAngle ? `rotate(${rot}deg) ` : '';
      targetChild.style.transform = `${rotateCss}scale(${fx}, ${fy})`;
    }
  };

  const applyOverlayAnchorInternal = (layer: LayerObject, anchorVal: string) => {
    if (!layer || !layer.overlay) return;
    if (layer.overlay.setAnchor) {
      const validAnchors = [
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'center',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ];
      const safeAnchor = validAnchors.includes(anchorVal) ? anchorVal : 'center';
      layer.overlay.setAnchor(safeAnchor);
    }
  };

  const applyLayerDraggableStateInternal = (layer: LayerObject) => {
    if (!layer || !layer.overlay) return;
    const isPan = mouseInteractionModeRef.current === 'pan' || isSpacePressedRef.current;
    const canDrag = !isPan && !layer.locked && currentActiveToolRef.current === null;
    if (layer.overlay.setDraggable) {
      layer.overlay.setDraggable(canDrag);
    } else if (layer.overlay.setOptions) {
      layer.overlay.setOptions({ draggable: canDrag });
    }
    attachVectorDragListeners(layer);
  };

  const renderSinglePointLayerInternal = (id: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer) return;

    const s = layer.data.type === 'point' ? layer.singlePointStyle : layer.stationStyle;
    const color = layer.style.color || '#ff9500';

    if (layer.overlay.setAnchor) layer.overlay.setAnchor('center');
    if (layer.overlay.setOffset) {
      const windowAMap = (window as any).AMap;
      if (windowAMap) layer.overlay.setOffset(new windowAMap.Pixel(s.offsetX || 0, s.offsetY || 0));
    }

    const windowAMap = (window as any).AMap;
    if (windowAMap) {
      if (s.textureUrl) {
        if (layer.overlay.setIcon) {
          layer.overlay.setIcon(
            new windowAMap.Icon({
              size: new windowAMap.Size(s.size, s.size),
              image: s.textureUrl,
              imageSize: new windowAMap.Size(s.size, s.size),
            })
          );
        }
      } else {
        const svgUrl = buildStationIconSvg(s.shape, color, s.size);
        if (layer.overlay.setIcon) {
          layer.overlay.setIcon(
            new windowAMap.Icon({
              size: new windowAMap.Size(s.size, s.size),
              image: svgUrl,
              imageSize: new windowAMap.Size(s.size, s.size),
            })
          );
        }
      }
    }

    if (layer.labelMarkers && layer.labelMarkers.length > 0 && mapInstance) {
      mapInstance.remove(layer.labelMarkers);
      layer.labelMarkers = [];
    }

    if (s && s.showLabel && windowAMap && mapInstance) {
      let pos = layer.data.location;
      if (!pos && layer.overlay.getPosition) {
        const p = layer.overlay.getPosition();
        if (p) pos = [p.lng, p.lat];
      }
      if (!pos) pos = [116.397428, 39.90923];

      const targetAnchor = getAnchorByOffsetDir(s.offset || 'top');

      const textMarker = new windowAMap.Text({
        text: layer.data.name,
        position: pos,
        anchor: targetAnchor,
        offset: new windowAMap.Pixel(s.labelOffsetX || 0, s.labelOffsetY || 0),
        zIndex: 130,
        style: {
          fontFamily: `"${s.fontFamily || globalTextConfig.fontFamily}", sans-serif`,
          fontSize: `${s.fontSize || globalTextConfig.fontSize}px`,
          fontWeight: `${s.fontWeight || globalTextConfig.fontWeight}`,
          color: s.textColor || '#1c1c1e',
          backgroundColor: s.bgColor || '#ffffff',
          padding: '2px 6px',
          border: `${s.labelBorderWidth || 1}px ${s.labelBorderStyle || 'solid'} ${s.labelBorderColor || '#d1d1d6'}`,
          borderRadius: `${s.labelBorderRadius || 4}px`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          whiteSpace: 'nowrap',
        },
      });

      textMarker.on('click', (e: any) => selectLayer(id, e.originEvent));
      mapInstance.add(textMarker);
      layer.labelMarkers = [textMarker];
    }

    applyLayerTransformsInternal(layer);
  };

  const createTextStyleObject = (s: any) => {
    const borderW = s.labelBorderWidth !== undefined ? s.labelBorderWidth : 1;
    const borderC = s.labelBorderColor || '#d1d1d6';
    const borderS = s.labelBorderStyle || 'solid';
    const borderR = s.labelBorderRadius !== undefined ? s.labelBorderRadius : 4;

    return {
      fontFamily: `"${s.fontFamily || globalTextConfig.fontFamily}", sans-serif`,
      fontSize: `${s.fontSize || globalTextConfig.fontSize}px`,
      fontWeight: `${s.fontWeight || globalTextConfig.fontWeight}`,
      color: s.textColor || '#1c1c1e',
      backgroundColor: s.bgColor || '#ffffff',
      padding: '2px 6px',
      border: `${borderW}px ${borderS} ${borderC}`,
      borderRadius: `${borderR}px`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    };
  };

  const renderStationElementsInternal = (id: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || !layer.data.viaStops || !mapInstance) return;

    if (layer.labelMarkers && layer.labelMarkers.length > 0) {
      mapInstance.remove(layer.labelMarkers);
      layer.labelMarkers = [];
    }
    if (layer.stationMarkers && layer.stationMarkers.length > 0) {
      mapInstance.remove(layer.stationMarkers);
      layer.stationMarkers = [];
    }

    const base = layer.stationStyle;
    const showIcons = !!base.showIcons;
    const showStations = !!base.showLabel;

    if (!showIcons && !showStations) return;

    const windowAMap = (window as any).AMap;
    if (!windowAMap) return;

    layer.data.viaStops.forEach((stop) => {
      const override = layer.stopOverrides.get(stop.id) || {};
      const s = { ...base, ...override };
      const stopPos =
        stop.location && (stop.location as any).lng
          ? [(stop.location as any).lng, (stop.location as any).lat]
          : [...(stop.location as [number, number])];
      const displayLabelText = s.labelText !== undefined && s.labelText !== '' ? s.labelText : stop.name;

      if (showIcons) {
        const iconUrl = s.textureUrl
          ? s.textureUrl
          : buildStationIconSvg(
            s.shape,
            s.color,
            s.size,
            s.iconBorderColor || '#ffffff',
            s.iconBorderWidth !== undefined ? s.iconBorderWidth : 2
          );
        const iconMarker = new windowAMap.Marker({
          position: stopPos,
          icon: new windowAMap.Icon({
            size: new windowAMap.Size(s.size, s.size),
            image: iconUrl,
            imageSize: new windowAMap.Size(s.size, s.size),
          }),
          anchor: 'center',
          offset: new windowAMap.Pixel(s.offsetX || 0, s.offsetY || 0),
          zIndex: 125,
        });
        iconMarker.on('click', (e: any) => selectLayer(id, e.originEvent));
        mapInstance.add(iconMarker);
        if (!layer.stationMarkers) layer.stationMarkers = [];
        layer.stationMarkers.push(iconMarker);
      }

      if (showStations) {
        const dir = s.offset || 'top';
        let offsetX = (s.labelOffsetX || 0) + (s.offsetX || 0);
        let offsetY = (s.labelOffsetY || 0) + (s.offsetY || 0);
        let anchor = 'bottom-center';
        if (dir === 'top') {
          anchor = 'bottom-center';
          offsetY -= s.size / 2 + 4;
        } else if (dir === 'bottom') {
          anchor = 'top-center';
          offsetY += s.size / 2 + 4;
        } else if (dir === 'left') {
          anchor = 'middle-right';
          offsetX -= s.size / 2 + 4;
        } else if (dir === 'right') {
          anchor = 'middle-left';
          offsetX += s.size / 2 + 4;
        }

        const textMarker = new windowAMap.Text({
          position: stopPos,
          text: displayLabelText,
          anchor: anchor,
          offset: new windowAMap.Pixel(offsetX, offsetY),
          zIndex: 130,
          draggable:
            !layer.locked &&
            mouseInteractionModeRef.current !== 'pan' &&
            !isSpacePressedRef.current,
          style: createTextStyleObject(s),
        });

        textMarker.on('dragend', (e: any) => {
          const pxPos = mapInstance.lngLatToContainer(stopPos);
          const dragPxPos = mapInstance.lngLatToContainer(e.lnglat);
          const newOffsetX = Math.round(dragPxPos.x - pxPos.x);
          const newOffsetY = Math.round(dragPxPos.y - pxPos.y);

          updateStopOverride(id, stop.id, 'labelOffsetX', newOffsetX);
          updateStopOverride(id, stop.id, 'labelOffsetY', newOffsetY);
        });

        textMarker.on('click', (e: any) => selectLayer(id, e.originEvent));
        mapInstance.add(textMarker);
        if (!layer.stationMarkers) layer.stationMarkers = [];
        layer.stationMarkers.push(textMarker);
      }
    });

    applyLayerTransformsInternal(layer);
  };

  const renderTextLayerInternal = (id: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer) return;
    const s = layer.textStyle;

    const textDiv = document.createElement('div');
    textDiv.innerText = layer.data.name || '标注文本';
    textDiv.style.fontFamily = `"${s.fontFamily || globalTextConfig.fontFamily}", sans-serif`;
    textDiv.style.fontSize = `${s.fontSize || globalTextConfig.fontSize}px`;
    textDiv.style.fontWeight = `${s.fontWeight || globalTextConfig.fontWeight}`;
    textDiv.style.color = s.textColor;
    textDiv.style.backgroundColor = s.bgColor;
    textDiv.style.opacity = `${s.opacity}`;
    textDiv.style.padding = '4px 8px';
    textDiv.style.borderRadius = `${s.borderRadius}px`;
    textDiv.style.whiteSpace = 'nowrap';
    textDiv.style.userSelect = 'none';
    textDiv.style.display = 'inline-block';
    textDiv.style.boxSizing = 'border-box';

    if (s.width && s.width !== 'auto') {
      textDiv.style.width = `${s.width}px`;
      textDiv.style.whiteSpace = 'normal';
      textDiv.style.wordBreak = 'break-all';
    } else {
      textDiv.style.width = 'max-content';
    }

    if (s.borderWidth > 0) {
      textDiv.style.border = `${s.borderWidth}px solid ${s.borderColor}`;
    }
    if (s.shadow) {
      textDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }

    textDiv.ondblclick = (e) => {
      e.stopPropagation();
      if (layer.locked) return;
      const promptVal = prompt('请输入新的标注文本：', layer.data.name || '标注文本');
      if (promptVal !== null && promptVal.trim() !== '') {
        editTextContent(id, promptVal.trim());
      }
    };

    if (layer.overlay.setContent) {
      layer.overlay.setContent(textDiv);
    }
    applyOverlayAnchorInternal(layer, s.anchor);
    applyLayerTransformsInternal(layer);
  };

  const renderImageLayerInternal = (id: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer) return;
    const s = layer.imageStyle;

    const img = document.createElement('img');
    // Use the selected image's intrinsic dimensions instead of a square
    // background box, so a newly-added image keeps its original aspect ratio.
    img.src = s.imageUrl;
    img.alt = layer.data.name || '图片标记';
    img.style.width = `${s.size}px`;
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.opacity = `${s.opacity}`;
    img.style.objectFit = 'contain';
    img.style.borderRadius = `${s.borderRadius}px`;

    if (s.borderWidth > 0) {
      img.style.border = `${s.borderWidth}px ${s.borderStyle} ${s.borderColor}`;
    }

    if (layer.overlay.setContent) {
      layer.overlay.setContent(img);
    }
    applyOverlayAnchorInternal(layer, s.anchor);
    applyLayerTransformsInternal(layer);
  };

  const addLayerToMapInternal = (item: LayerItemData, flash: boolean = false) => {
    const windowAMap = (window as any).AMap;
    if (!windowAMap || !mapInstance) return;

    let overlay: any;
    const defaultStyle: LayerStyle = {
      color: item.type === 'line' ? '#007AFF' : item.type === 'station' ? '#ff9500' : '#ff3b30',
      strokeWeight: 6,
      opacity: 0.85,
      strokeStyle: 'solid',
      lineJoin: 'miter',
      showDir: true,
      borderWeight: 0,
      borderColor: '#ffffff',
      showIcons: true,
      showStations: false,
    };

    const defaultStationStyle: StationStyle = {
      showIcons: true,
      shape: 'circle',
      color: defaultStyle.color,
      size: 14,
      iconBorderColor: '#ffffff',
      iconBorderWidth: 2,
      textureUrl: '',
      offsetX: 0,
      offsetY: 0,
      showLabel: true,
      textColor: '#1c1c1e',
      bgColor: '#ffffff',
      fontSize: globalTextConfig.fontSize,
      fontWeight: globalTextConfig.fontWeight,
      fontFamily: globalTextConfig.fontFamily,
      labelBorderColor: '#d1d1d6',
      labelBorderWidth: 1,
      labelBorderStyle: 'solid',
      labelBorderRadius: 4,
      labelOffsetX: 0,
      labelOffsetY: -8,
      offset: 'top',
      allowOverZoom: true,
    };

    const defaultSinglePointStyle: SinglePointStyle = {
      showLabel: true,
      shape: 'pin',
      size: 28,
      textureUrl: '',
      offsetX: 0,
      offsetY: 0,
      offset: 'top',
      textColor: '#1c1c1e',
      bgColor: '#ffffff',
      fontSize: globalTextConfig.fontSize,
      fontWeight: globalTextConfig.fontWeight,
      fontFamily: globalTextConfig.fontFamily,
      labelBorderColor: '#d1d1d6',
      labelBorderWidth: 1,
      labelBorderStyle: 'solid',
      labelBorderRadius: 4,
      labelOffsetX: 0,
      labelOffsetY: -12,
      allowOverZoom: true,
    };

    if (item.type === 'line' || item.type === 'pen') {
      overlay = new windowAMap.Polyline({
        path: item.path || [],
        strokeColor: defaultStyle.color,
        strokeWeight: defaultStyle.strokeWeight,
        strokeOpacity: defaultStyle.opacity,
        strokeStyle: defaultStyle.strokeStyle,
        lineJoin: defaultStyle.lineJoin,
        showDir: defaultStyle.showDir,
        borderWeight: defaultStyle.borderWeight,
        isOutline: defaultStyle.borderWeight > 0,
        outlineColor: defaultStyle.borderColor,
      });
    } else if (item.type === 'rectangle') {
      const path = item.path || [];
      const lngs = path.map(([lng]) => lng);
      const lats = path.map(([, lat]) => lat);
      overlay = new windowAMap.Rectangle({
        bounds:
          path.length > 0
            ? [
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)],
            ]
            : undefined,
        strokeColor: '#007AFF',
        strokeWeight: 2,
        fillColor: '#007AFF',
        fillOpacity: 0.3,
      });
    } else if (item.type === 'polygon') {
      overlay = new windowAMap.Polygon({
        path: item.path || [],
        strokeColor: '#007AFF',
        strokeWeight: 2,
        fillColor: '#007AFF',
        fillOpacity: 0.3,
      });
    } else if (item.type === 'circle') {
      overlay = new windowAMap.Circle({
        center: item.location || [116.397428, 39.90923],
        radius: item.radius ?? 1000,
        strokeColor: '#007AFF',
        strokeWeight: 2,
        fillColor: '#007AFF',
        fillOpacity: 0.3,
      });
    } else {
      const targetLocation = item.location && Array.isArray(item.location) ? item.location : [116.397428, 39.90923];
      overlay = new windowAMap.Marker({
        position: targetLocation,
        title: item.name,
        icon: createCustomIcon(defaultStyle.color),
        anchor: 'center',
        offset: new windowAMap.Pixel(0, 0),
      });
    }

    mapInstance.add(overlay);
    mapInstance.setFitView();

    // overlay.on('click', (e: any) => selectLayer(item.id, e.originEvent));
    const handleOverlaySelect = (e: any) => {
      // 为原生事件对象打上标记，通知 MapCanvas 不要生成选框
      if (e.originEvent) {
        (e.originEvent as any)._isOverlayTarget = true;
      }
      // 在选择模式下，鼠标按下时立即选中该图层
      if (mouseInteractionModeRef.current === 'select') {
        selectLayer(item.id, e.originEvent);
      }
    };

    if (overlay.on) {
      overlay.on('mousedown', handleOverlaySelect); // 处理按下和拖拽前置
      overlay.on('click', handleOverlaySelect);     // 保留 click 以兼容部分交互逻辑

      // 保持原有的 dragend 监听不变
      overlay.on('dragend', (e: any) => {
        if (layerObj.data.location) {
          layerObj.data.location = [e.lnglat.lng, e.lnglat.lat];
        }
        if (item.type === 'point' || item.type === 'station') {
          renderSinglePointLayerInternal(item.id);
        }
        pushSnapshot();
      });
    }

    if (flash) {
      setTimeout(() => {
        const dom = overlay.getElement ? overlay.getElement() : null;
        if (dom) {
          dom.classList.add('amap-polyline-flashing');
          setTimeout(() => dom.classList.remove('amap-polyline-flashing'), 3000);
        }
      }, 50);
    }

    const layerObj: LayerObject = {
      overlay,
      labelMarkers: [],
      stationMarkers: [],
      endpointMarkers: [],
      data: item,
      style: defaultStyle,
      stationStyle: defaultStationStyle,
      stopOverrides: new Map(),
      singlePointStyle: defaultSinglePointStyle,
      shapeStyle: {
        opacity: 0.85,
        fillColor: '#007AFF',
        fillOpacity: 0.3,
        borderColor: '#007AFF',
        borderWidth: 2,
        borderStyle: 'solid',
        anchor: 'center',
      },
      imageStyle: {
        opacity: 1.0,
        size: 80,
        borderColor: '#007AFF',
        borderWidth: 0,
        borderStyle: 'solid',
        borderRadius: 8,
        imageUrl: '',
        anchor: 'center',
      },
      penStyle: { opacity: 0.85, color: '#007AFF', strokeWeight: 4, strokeStyle: 'solid' },
      textStyle: {
        opacity: 1.0,
        textColor: '#1c1c1e',
        fontSize: 14,
        fontWeight: globalTextConfig.fontWeight,
        fontFamily: globalTextConfig.fontFamily,
        bgColor: '#ffffff',
        borderColor: '#007AFF',
        borderWidth: 1,
        shadow: true,
        borderRadius: 6,
        width: 'auto',
        anchor: 'center',
      },
      rotation: 0,
      flipX: false,
      flipY: false,
      activeTab: 'style',
      editor: null,
      isEditing: false,
      visible: true,
      locked: false,
    };

    if (overlay.on) {
      overlay.on('dragend', (e: any) => {
        if (layerObj.data.location) {
          layerObj.data.location = [e.lnglat.lng, e.lnglat.lat];
        }
        if (item.type === 'point' || item.type === 'station') {
          renderSinglePointLayerInternal(item.id);
        }
        pushSnapshot();
      });
    }

    layerMapRef.current.set(item.id, layerObj);
    applyLayerDraggableStateInternal(layerObj);

    setLayerTree((prev) => (prev.includes(item.id) ? prev : [item.id, ...prev]));

    if (item.type === 'station' || item.type === 'point') {
      renderSinglePointLayerInternal(item.id);
    } else if (item.type === 'line') {
      renderStationElementsInternal(item.id);
    }

    pushSnapshot();
    forceUpdateLayers();
  };

  const addLayerToMap = (item: LayerItemData, flash = false) => {
    addLayerToMapInternal(item, flash);
  };

  const addCustomDrawOverlayToLayer = (overlay: any, toolTypeOverride?: DrawToolType) => {
    const tool = toolTypeOverride || currentActiveToolRef.current;
    if (!tool || !overlay) {
      if (overlay && mapInstance) {
        try {
          mapInstance.remove(overlay);
        } catch (e) { }
      }
      deactivateDrawTools();
      return;
    }

    const newId = `${tool}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let itemData: LayerItemData;
    let shapeStyle: ShapeStyle = {
      fillColor: '#007AFF',
      fillOpacity: 0.3,
      borderColor: '#007AFF',
      borderWidth: 2,
      borderStyle: 'solid',
      opacity: 1,
      anchor: 'center',
    };
    let penStyle: PenStyle = {
      color: '#007AFF',
      strokeWeight: 4,
      opacity: 1,
      strokeStyle: 'solid',
    };
    let imageStyle: ImageStyle = {
      imageUrl: pendingUploadedImageUrlRef.current || 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=200&auto=format&fit=crop&q=80',
      size: 60,
      opacity: 1,
      borderRadius: 8,
      borderWidth: 0,
      borderColor: '#007AFF',
      borderStyle: 'solid',
      anchor: 'center',
    };
    let textStyle: TextStyle = {
      textColor: '#1c1c1e',
      bgColor: '#ffffff',
      opacity: 1,
      fontSize: globalTextConfig.fontSize,
      fontWeight: globalTextConfig.fontWeight,
      fontFamily: globalTextConfig.fontFamily,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#d1d1d6',
      shadow: true,
      width: 'auto',
      anchor: 'center',
    };

    if (tool === 'rectangle') {
      let path: [number, number][] = [];
      if (overlay.getPath) {
        const p = overlay.getPath();
        path = p ? p.map((pt: any) => [pt.lng, pt.lat]) : [];
      }
      itemData = {
        id: newId,
        name: '新建矩形',
        sub: '地图矩形区域',
        type: 'rectangle',
        category: '绘制',
        iconClass: 'fa-regular font-square',
        iconBgClass: 'icon-shape',
        path,
      };
    } else if (tool === 'circle') {
      let center: [number, number] = [116.397428, 39.90923];
      if (overlay.getCenter) {
        const c = overlay.getCenter();
        if (c) center = [c.lng, c.lat];
      }
      const radius = overlay.getRadius ? overlay.getRadius() : 1000;
      itemData = {
        id: newId,
        name: '新建圆形',
        sub: '地图圆形区域',
        type: 'circle',
        category: '绘制',
        iconClass: 'fa-regular font-circle',
        iconBgClass: 'icon-shape',
        location: center,
        radius,
      };
    } else if (tool === 'polygon') {
      let path: [number, number][] = [];
      if (overlay.getPath) {
        const p = overlay.getPath();
        path = p ? p.map((pt: any) => [pt.lng, pt.lat]) : [];
      }
      itemData = {
        id: newId,
        name: '新建多边形',
        sub: '地图多边形区域',
        type: 'polygon',
        category: '绘制',
        iconClass: 'fa-solid fa-shapes',
        iconBgClass: 'icon-shape',
        path,
      };
    } else if (tool === 'pen') {
      let path: [number, number][] = [];
      if (overlay.getPath) {
        const p = overlay.getPath();
        path = p ? p.map((pt: any) => [pt.lng, pt.lat]) : [];
      }
      itemData = {
        id: newId,
        name: '手绘钢笔',
        sub: '自由绘制折线/钢笔',
        type: 'pen',
        category: '绘制',
        iconClass: 'fa-solid fa-pen-nib',
        iconBgClass: 'icon-line',
        path,
      };
    } else if (tool === 'image') {
      let pos: [number, number] = [116.397428, 39.90923];
      if (overlay.getPosition) {
        const p = overlay.getPosition();
        if (p) pos = [p.lng, p.lat];
      }
      itemData = {
        id: newId,
        name: '图片标记',
        sub: '自定义图片贴图',
        type: 'image',
        category: '绘制',
        iconClass: 'fa-regular fa-image',
        iconBgClass: 'icon-point',
        location: pos,
      };
    } else if (tool === 'text') {
      let pos: [number, number] = [116.397428, 39.90923];
      if (overlay.getPosition) {
        const p = overlay.getPosition();
        if (p) pos = [p.lng, p.lat];
      }
      itemData = {
        id: newId,
        name: '标注文本',
        sub: '地图位置文本标注',
        type: 'text',
        category: '绘制',
        iconClass: 'fa-solid fa-font',
        iconBgClass: 'icon-point',
        location: pos,
      };
    } else {
      return;
    }

    const defaultStyle: LayerStyle = {
      color: '#007AFF',
      strokeWeight: 4,
      opacity: 0.85,
      strokeStyle: 'solid',
      lineJoin: 'miter',
      showDir: true,
      borderWeight: 0,
      borderColor: '#ffffff',
      showIcons: true,
      showStations: false,
    };

    const layerObj: LayerObject = {
      data: itemData,
      overlay,
      labelMarkers: [],
      stationMarkers: [],
      endpointMarkers: [],
      style: defaultStyle,
      stationStyle: {
        showIcons: true,
        shape: 'circle',
        color: '#007AFF',
        size: 14,
        iconBorderColor: '#ffffff',
        iconBorderWidth: 2,
        textureUrl: '',
        offsetX: 0,
        offsetY: 0,
        showLabel: true,
        textColor: '#1c1c1e',
        bgColor: '#ffffff',
        fontSize: globalTextConfig.fontSize,
        fontWeight: globalTextConfig.fontWeight,
        fontFamily: globalTextConfig.fontFamily,
        labelBorderColor: '#d1d1d6',
        labelBorderWidth: 1,
        labelBorderStyle: 'solid',
        labelBorderRadius: 4,
        labelOffsetX: 0,
        labelOffsetY: -8,
        offset: 'top',
        allowOverZoom: true,
      },
      singlePointStyle: {
        showLabel: true,
        shape: 'pin',
        size: 28,
        textureUrl: '',
        offsetX: 0,
        offsetY: 0,
        offset: 'top',
        textColor: '#1c1c1e',
        bgColor: '#ffffff',
        fontSize: globalTextConfig.fontSize,
        fontWeight: globalTextConfig.fontWeight,
        fontFamily: globalTextConfig.fontFamily,
        labelBorderColor: '#d1d1d6',
        labelBorderWidth: 1,
        labelBorderStyle: 'solid',
        labelBorderRadius: 4,
        labelOffsetX: 0,
        labelOffsetY: -12,
        allowOverZoom: true,
      },
      shapeStyle,
      imageStyle,
      penStyle,
      textStyle,
      stopOverrides: new Map(),
      rotation: 0,
      flipX: false,
      flipY: false,
      isEditing: false,
      visible: true,
      locked: false,
    };

    layerMapRef.current.set(newId, layerObj);
    setLayerTree((prev) => [newId, ...prev]);

    // overlay.on('click', (e: any) => selectLayer(newId, e.originEvent));
    const handleOverlaySelect = (e: any) => {
      if (e.originEvent) {
        (e.originEvent as any)._isOverlayTarget = true;
      }
      if (mouseInteractionModeRef.current === 'select') {
        selectLayer(newId, e.originEvent);
      }
    };

    if (overlay.on) {
      overlay.on('mousedown', handleOverlaySelect);
      overlay.on('click', handleOverlaySelect);
    }

    if (tool === 'image') {
      renderImageLayerInternal(newId);
    } else if (tool === 'text') {
      renderTextLayerInternal(newId);
    }

    applyLayerDraggableStateInternal(layerObj);
    applyLayerTransformsInternal(layerObj);

    selectLayer(newId);
    deactivateDrawTools();
    setPendingUploadedImageUrl(null);
    pushSnapshot();
    forceUpdateLayers();
  };

  const addLayerFromSearch = (item: LayerItemData) => {
    const newItem = JSON.parse(JSON.stringify(item));
    const count = Array.from(layerMapRef.current.values()).filter((l: any) => l.data.name.startsWith(newItem.name)).length;
    newItem.id = newItem.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    if (count > 0) newItem.name = `${newItem.name} (${count + 1})`;

    addLayerToMapInternal(newItem, true);
    selectLayer(newItem.id);
  };

  const removeLayerFromMap = (id: string) => {
    const layer = layerMapRef.current.get(id);
    if (layer) {
      if (layer.locked) {
        alert('该图层已被锁定，无法移除！');
        return;
      }
      if (layer.isEditing) {
        toggleUniversalEditing(id);
      }
      if (layer.labelMarkers && layer.labelMarkers.length > 0 && mapInstance) {
        mapInstance.remove(layer.labelMarkers);
        layer.labelMarkers = [];
      }
      if (layer.stationMarkers && layer.stationMarkers.length > 0 && mapInstance) {
        mapInstance.remove(layer.stationMarkers);
        layer.stationMarkers = [];
      }
      if (layer.endpointMarkers && layer.endpointMarkers.length > 0 && mapInstance) {
        mapInstance.remove(layer.endpointMarkers);
        layer.endpointMarkers = [];
      }
      if (mapInstance) mapInstance.remove(layer.overlay);
      layerMapRef.current.delete(id);
      removeItemFromTree(id);
      pushSnapshot();
      forceUpdateLayers();
    }
  };

  const removeItemFromTree = (targetId: string) => {
    setLayerTree((prev) => {
      const recursiveRemove = (treeArray: string[]): string[] => {
        return treeArray.filter((id) => {
          if (id === targetId) return false;
          if (folderMapRef.current.has(id)) {
            const folder = folderMapRef.current.get(id)!;
            folder.children = recursiveRemove(folder.children);
          }
          return true;
        });
      };
      return recursiveRemove(prev);
    });
  };

  const selectLayer = (id: string, event?: any) => {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey)) {
      setMultiSelectedLayerIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        if (focusedLayerId && !next.has(focusedLayerId)) {
          next.add(focusedLayerId);
        }
        return next;
      });
    } else {
      setMultiSelectedLayerIds(new Set());
      setFocusedLayerId(id);
    }
    setIsInspectorPanelOpen(true);
    forceUpdateLayers();
  };

  const selectLayersInBox = (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    isShiftPressed: boolean
  ) => {
    if (!mapInstance) return;

    const selectedIds: string[] = [];

    layerMapRef.current.forEach((layer, id) => {
      if (!layer.visible) return;

      let layerMinX = Infinity;
      let layerMaxX = -Infinity;
      let layerMinY = Infinity;
      let layerMaxY = -Infinity;

      const includePoint = (px: { x: number; y: number }) => {
        if (!px) return;
        if (px.x < layerMinX) layerMinX = px.x;
        if (px.x > layerMaxX) layerMaxX = px.x;
        if (px.y < layerMinY) layerMinY = px.y;
        if (px.y > layerMaxY) layerMaxY = px.y;
      };

      // 1. Check path points (Polyline, Polygon, Rectangle, Pen)
      if (layer.data.path && Array.isArray(layer.data.path) && layer.data.path.length > 0) {
        layer.data.path.forEach((pt: [number, number]) => {
          const px = mapInstance.lngLatToContainer(pt);
          includePoint(px);
        });
      }

      // 2. Check stops (Line/Subway)
      if (layer.data.stops && Array.isArray(layer.data.stops) && layer.data.stops.length > 0) {
        layer.data.stops.forEach((st: any) => {
          if (st.location) {
            const px = mapInstance.lngLatToContainer(st.location);
            includePoint(px);
          }
        });
      }

      // 3. Check location (Point, Circle, Marker, Text, Image)
      if (layer.data.location && Array.isArray(layer.data.location)) {
        const px = mapInstance.lngLatToContainer(layer.data.location);
        if (px) {
          const radius = layer.data.type === 'circle' ? 30 : 18;
          includePoint({ x: px.x - radius, y: px.y - radius });
          includePoint({ x: px.x + radius, y: px.y + radius });
        }
      }

      // 4. Check overlay bounds if available
      if (layer.overlay && layer.overlay.getBounds) {
        try {
          const bounds = layer.overlay.getBounds();
          if (bounds) {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            if (sw && ne) {
              const pxSW = mapInstance.lngLatToContainer(sw);
              const pxNE = mapInstance.lngLatToContainer(ne);
              includePoint(pxSW);
              includePoint(pxNE);
            }
          }
        } catch (e) { }
      }

      // 5. Check DOM bounding box if available
      if (layer.overlay && layer.overlay.getElement) {
        try {
          const elem = layer.overlay.getElement();
          if (elem) {
            const mapElem = mapInstance.getContainer ? mapInstance.getContainer() : null;
            if (mapElem) {
              const mapRect = mapElem.getBoundingClientRect();
              const elemRect = elem.getBoundingClientRect();
              if (elemRect && elemRect.width > 0 && elemRect.height > 0) {
                includePoint({ x: elemRect.left - mapRect.left, y: elemRect.top - mapRect.top });
                includePoint({ x: elemRect.right - mapRect.left, y: elemRect.bottom - mapRect.top });
              }
            }
          }
        } catch (e) { }
      }

      // Check AABB intersection
      if (layerMinX !== Infinity) {
        const intersects =
          layerMinX <= maxX &&
          layerMaxX >= minX &&
          layerMinY <= maxY &&
          layerMaxY >= minY;

        if (intersects) {
          selectedIds.push(id);
        }
      }
    });

    if (selectedIds.length === 0) {
      if (!isShiftPressed) {
        setFocusedLayerId(null);
        setMultiSelectedLayerIds(new Set());
      }
    } else {
      if (isShiftPressed) {
        setMultiSelectedLayerIds((prev) => {
          const next = new Set(prev);
          if (focusedLayerId) next.add(focusedLayerId);
          selectedIds.forEach((id) => next.add(id));
          return next;
        });
      } else {
        if (selectedIds.length === 1) {
          setFocusedLayerId(selectedIds[0]);
          setMultiSelectedLayerIds(new Set());
        } else {
          setFocusedLayerId(selectedIds[0]);
          setMultiSelectedLayerIds(new Set(selectedIds));
        }
      }
      setIsInspectorPanelOpen(true);
    }
    forceUpdateLayers();
  };

  const toggleLayerVisibility = (id: string, e?: any) => {
    if (e) e.stopPropagation();
    const layer = layerMapRef.current.get(id);
    if (!layer) return;
    if (layer.locked) {
      alert('图层已锁定，不可调整状态');
      return;
    }

    layer.visible = !layer.visible;
    if (layer.visible) {
      layer.overlay.show();
      if (layer.labelMarkers) layer.labelMarkers.forEach((m) => m.show());
      if (layer.stationMarkers) layer.stationMarkers.forEach((m) => m.show());
      if (layer.endpointMarkers) layer.endpointMarkers.forEach((m) => m.show());
    } else {
      layer.overlay.hide();
      if (layer.labelMarkers) layer.labelMarkers.forEach((m) => m.hide());
      if (layer.stationMarkers) layer.stationMarkers.forEach((m) => m.hide());
      if (layer.endpointMarkers) layer.endpointMarkers.forEach((m) => m.hide());
      if (layer.isEditing) {
        toggleUniversalEditing(id);
      }
    }
    pushSnapshot();
    forceUpdateLayers();
  };

  const toggleLayerLock = (id: string, e?: any) => {
    if (e) e.stopPropagation();
    const layer = layerMapRef.current.get(id);
    if (!layer) return;

    layer.locked = !layer.locked;
    if (layer.isEditing && layer.locked) {
      toggleUniversalEditing(id);
    }

    applyLayerDraggableStateInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;

    (layer.style as any)[key] = value;
    const { overlay, data } = layer;

    if (data.type === 'line') {
      if (key === 'color') overlay.setOptions({ strokeColor: value });
      if (key === 'strokeWeight') overlay.setOptions({ strokeWeight: parseInt(value, 10) });
      if (key === 'opacity') overlay.setOptions({ strokeOpacity: parseFloat(value) });
      if (key === 'strokeStyle') overlay.setOptions({ strokeStyle: value });
      if (key === 'lineJoin') overlay.setOptions({ lineJoin: value });
      if (key === 'showDir') overlay.setOptions({ showDir: value });
      if (key === 'borderWeight') {
        const bw = parseInt(value, 10);
        overlay.setOptions({ borderWeight: bw, isOutline: bw > 0 });
      }
      if (key === 'borderColor') overlay.setOptions({ outlineColor: value });
    }
    applyLayerTransformsInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateShapeStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    (layer.shapeStyle as any)[key] = value;
    const s = layer.shapeStyle;

    const strokeDash = s.borderStyle === 'dashed' ? [10, 10] : s.borderStyle === 'dotted' ? [3, 3] : [0, 0];

    if (layer.overlay.setOptions) {
      layer.overlay.setOptions({
        strokeColor: s.borderColor,
        strokeWeight: parseInt(s.borderWidth as any, 10),
        strokeOpacity: parseFloat(s.opacity as any),
        fillColor: s.fillColor,
        fillOpacity: parseFloat(s.fillOpacity !== undefined ? String(s.fillOpacity) : String(s.opacity)),
        strokeStyle: s.borderStyle === 'solid' ? 'solid' : 'dashed',
        strokeDasharray: strokeDash,
      });
    }

    if (key === 'anchor') applyOverlayAnchorInternal(layer, value);
    applyLayerTransformsInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateImageStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    (layer.imageStyle as any)[key] = value;
    if (key === 'anchor') applyOverlayAnchorInternal(layer, value);
    renderImageLayerInternal(id);
    applyLayerTransformsInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updatePenStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    (layer.penStyle as any)[key] = value;
    const s = layer.penStyle;

    const strokeDash = s.strokeStyle === 'dashed' ? [10, 10] : s.strokeStyle === 'dotted' ? [3, 3] : [0, 0];

    if (layer.overlay.setOptions) {
      layer.overlay.setOptions({
        strokeColor: s.color,
        strokeWeight: parseInt(s.strokeWeight as any, 10),
        strokeOpacity: parseFloat(s.opacity as any),
        strokeStyle: s.strokeStyle === 'solid' ? 'solid' : 'dashed',
        strokeDasharray: strokeDash,
      });
    }
    applyLayerTransformsInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateTextStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    (layer.textStyle as any)[key] = value;
    if (key === 'anchor') applyOverlayAnchorInternal(layer, value);
    renderTextLayerInternal(id);
    applyLayerTransformsInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const editTextContent = (id: string, newText: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    layer.data.name = newText;
    renderTextLayerInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateStationStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    (layer.stationStyle as any)[key] = value;
    renderStationElementsInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateSinglePointStyle = (id: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    (layer.singlePointStyle as any)[key] = value;
    renderSinglePointLayerInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateLayerTransform = (id: string, key: 'rotation' | 'flipX' | 'flipY', value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;

    if (key === 'rotation') layer.rotation = parseFloat(value) || 0;
    if (key === 'flipX') layer.flipX = !!value;
    if (key === 'flipY') layer.flipY = !!value;

    applyLayerTransformsInternal(layer);
    pushSnapshot();
    forceUpdateLayers();
  };

  const toggleUniversalEditing = (id: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer) return;
    if (layer.locked) {
      alert('图层已锁定，无法编辑');
      return;
    }

    const type = layer.data.type;
    if (type === 'text') return;

    layer.isEditing = !layer.isEditing;

    const windowAMap = (window as any).AMap;
    if (layer.isEditing && windowAMap && mapInstance) {
      if (type === 'line' || type === 'pen') {
        layer.editor = new windowAMap.PolylineEditor(mapInstance, layer.overlay);
        layer.editor.open();
      } else if (type === 'rectangle') {
        layer.editor = new windowAMap.RectangleEditor(mapInstance, layer.overlay);
        layer.editor.open();
      } else if (type === 'circle') {
        layer.editor = new windowAMap.CircleEditor(mapInstance, layer.overlay);
        layer.editor.open();
      } else if (type === 'polygon') {
        layer.editor = new windowAMap.PolygonEditor(mapInstance, layer.overlay);
        layer.editor.open();
      } else if (['point', 'station', 'image'].includes(type)) {
        applyLayerDraggableStateInternal(layer);
      }
    } else {
      if (layer.editor) {
        layer.editor.close();
        layer.editor = null;
      }
      exitBoxSelectNodesMode();
      pushSnapshot();
    }

    forceUpdateLayers();
  };

  const toggleStationsControl = (id: string, key: string, checked: boolean) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;

    if (key === 'showIcons' || key === 'showStations') {
      (layer.style as any)[key] = checked;
    } else if (key === 'stationShowIcons') {
      layer.stationStyle.showIcons = checked;
    } else if (key === 'stationShowLabel') {
      layer.stationStyle.showLabel = checked;
    }

    renderStationElementsInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const updateStopOverride = (id: string, stopId: string, key: string, value: any) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;

    if (!layer.stopOverrides.has(stopId)) {
      layer.stopOverrides.set(stopId, {});
    }
    const override = layer.stopOverrides.get(stopId)!;
    (override as any)[key] = value;

    renderStationElementsInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const clearStopOverride = (id: string, stopId: string) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    layer.stopOverrides.delete(stopId);
    renderStationElementsInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const toggleSinglePointLabelControl = (id: string, checked: boolean) => {
    const layer = layerMapRef.current.get(id);
    if (!layer || layer.locked) return;
    if (layer.data.type === 'point') {
      layer.singlePointStyle.showLabel = checked;
    } else if (layer.data.type === 'station') {
      layer.stationStyle.showLabel = checked;
    } else {
      layer.singlePointStyle.showLabel = checked;
    }

    renderSinglePointLayerInternal(id);
    pushSnapshot();
    forceUpdateLayers();
  };

  const copyLayerStyle = () => {
    if (!rightClickedLayerId) return;
    const layer = layerMapRef.current.get(rightClickedLayerId);
    if (!layer) return;

    setCopiedStyleData({
      type: layer.data.type,
      style: JSON.parse(JSON.stringify(layer.style || {})),
      stationStyle: JSON.parse(JSON.stringify(layer.stationStyle || {})),
      singlePointStyle: JSON.parse(JSON.stringify(layer.singlePointStyle || {})),
      shapeStyle: JSON.parse(JSON.stringify(layer.shapeStyle || {})),
      imageStyle: JSON.parse(JSON.stringify(layer.imageStyle || {})),
      penStyle: JSON.parse(JSON.stringify(layer.penStyle || {})),
      textStyle: JSON.parse(JSON.stringify(layer.textStyle || {})),
      rotation: layer.rotation || 0,
      flipX: !!layer.flipX,
      flipY: !!layer.flipY,
    });
    setContextMenuPos(null);
  };

  const pasteLayerStyle = () => {
    if (!rightClickedLayerId || !copiedStyleData) return;
    const targetLayer = layerMapRef.current.get(rightClickedLayerId);
    if (!targetLayer) return;

    if (targetLayer.locked) {
      alert('当前图层已锁定，无法修改样式');
      return;
    }

    const targetType = targetLayer.data.type;

    targetLayer.rotation = copiedStyleData.rotation || 0;
    targetLayer.flipX = !!copiedStyleData.flipX;
    targetLayer.flipY = !!copiedStyleData.flipY;

    if (targetLayer.style && copiedStyleData.style) {
      targetLayer.style = { ...targetLayer.style, ...JSON.parse(JSON.stringify(copiedStyleData.style)) };
    }

    if (targetType === 'line') {
      if (copiedStyleData.stationStyle)
        targetLayer.stationStyle = {
          ...targetLayer.stationStyle,
          ...JSON.parse(JSON.stringify(copiedStyleData.stationStyle)),
        };
      updateStyle(rightClickedLayerId, 'color', targetLayer.style.color);
      updateStyle(rightClickedLayerId, 'strokeWeight', targetLayer.style.strokeWeight);
      renderStationElementsInternal(rightClickedLayerId);
    } else if (targetType === 'station' || targetType === 'point') {
      if (targetType === 'station' && copiedStyleData.stationStyle) {
        targetLayer.stationStyle = {
          ...targetLayer.stationStyle,
          ...JSON.parse(JSON.stringify(copiedStyleData.stationStyle)),
        };
      } else if (copiedStyleData.singlePointStyle) {
        targetLayer.singlePointStyle = {
          ...targetLayer.singlePointStyle,
          ...JSON.parse(JSON.stringify(copiedStyleData.singlePointStyle)),
        };
      }
      renderSinglePointLayerInternal(rightClickedLayerId);
    } else if (['rectangle', 'circle', 'polygon'].includes(targetType) && copiedStyleData.shapeStyle) {
      targetLayer.shapeStyle = {
        ...targetLayer.shapeStyle,
        ...JSON.parse(JSON.stringify(copiedStyleData.shapeStyle)),
      };
      updateShapeStyle(rightClickedLayerId, 'fillColor', targetLayer.shapeStyle.fillColor);
    } else if (targetType === 'image' && copiedStyleData.imageStyle) {
      const keepUrl = targetLayer.imageStyle.imageUrl;
      targetLayer.imageStyle = {
        ...targetLayer.imageStyle,
        ...JSON.parse(JSON.stringify(copiedStyleData.imageStyle)),
      };
      targetLayer.imageStyle.imageUrl = keepUrl;
      renderImageLayerInternal(rightClickedLayerId);
    } else if (targetType === 'pen' && copiedStyleData.penStyle) {
      targetLayer.penStyle = {
        ...targetLayer.penStyle,
        ...JSON.parse(JSON.stringify(copiedStyleData.penStyle)),
      };
      updatePenStyle(rightClickedLayerId, 'color', targetLayer.penStyle.color);
    } else if (targetType === 'text' && copiedStyleData.textStyle) {
      targetLayer.textStyle = {
        ...targetLayer.textStyle,
        ...JSON.parse(JSON.stringify(copiedStyleData.textStyle)),
      };
      renderTextLayerInternal(rightClickedLayerId);
    }

    applyLayerTransformsInternal(targetLayer);
    pushSnapshot();
    forceUpdateLayers();
    setContextMenuPos(null);
  };

  // Folder Operations
  const createNewFolder = (parentFolderId: string | null = null) => {
    const folderName = prompt('请输入新文件夹名称：', '未命名文件夹');
    if (!folderName || !folderName.trim()) return;

    const folderId = 'folder_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const folderObj: FolderObject = {
      id: folderId,
      name: folderName.trim(),
      isFolder: true,
      collapsed: false,
      children: [],
      visible: true,
    };

    folderMapRef.current.set(folderId, folderObj);

    if (parentFolderId && folderMapRef.current.has(parentFolderId)) {
      folderMapRef.current.get(parentFolderId)!.children.unshift(folderId);
    } else {
      setLayerTree((prev) => [folderId, ...prev]);
    }

    pushSnapshot();
    forceUpdateLayers();
  };

  const toggleFolderCollapse = (folderId: string, event?: any) => {
    if (event) event.stopPropagation();
    const folder = folderMapRef.current.get(folderId);
    if (!folder) return;
    folder.collapsed = !folder.collapsed;
    forceUpdateLayers();
  };

  const toggleFolderVisibility = (folderId: string, event?: any) => {
    if (event) event.stopPropagation();
    const folder = folderMapRef.current.get(folderId);
    if (!folder) return;

    folder.visible = !folder.visible;

    const setChildVisible = (id: string, vis: boolean) => {
      if (folderMapRef.current.has(id)) {
        const f = folderMapRef.current.get(id)!;
        f.visible = vis;
        f.children.forEach((cId) => setChildVisible(cId, vis));
      } else if (layerMapRef.current.has(id)) {
        const layer = layerMapRef.current.get(id)!;
        layer.visible = vis;
        if (vis) {
          layer.overlay.show();
          if (layer.labelMarkers) layer.labelMarkers.forEach((m) => m.show());
          if (layer.stationMarkers) layer.stationMarkers.forEach((m) => m.show());
        } else {
          layer.overlay.hide();
          if (layer.labelMarkers) layer.labelMarkers.forEach((m) => m.hide());
          if (layer.stationMarkers) layer.stationMarkers.forEach((m) => m.hide());
        }
      }
    };

    folder.children.forEach((cId) => setChildVisible(cId, folder.visible));
    pushSnapshot();
    forceUpdateLayers();
  };

  const deleteFolder = (folderId: string) => {
    if (!confirm('确定要删除此文件夹及其内部包含的所有图层吗？')) return;

    const recursivelyRemove = (id: string) => {
      if (folderMapRef.current.has(id)) {
        const f = folderMapRef.current.get(id)!;
        f.children.forEach((cId) => recursivelyRemove(cId));
        folderMapRef.current.delete(id);
      } else if (layerMapRef.current.has(id)) {
        removeLayerFromMap(id);
      }
    };

    recursivelyRemove(folderId);
    removeItemFromTree(folderId);
    pushSnapshot();
    forceUpdateLayers();
  };

  const groupSelectedLayers = () => {
    if (multiSelectedLayerIds.size < 2) return;
    const folderName = prompt('请输入新建组合文件夹的名称：', '分组图层');
    if (!folderName || !folderName.trim()) return;

    const folderId = 'folder_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const folderObj: FolderObject = {
      id: folderId,
      name: folderName.trim(),
      isFolder: true,
      collapsed: false,
      children: Array.from(multiSelectedLayerIds),
      visible: true,
    };

    folderMapRef.current.set(folderId, folderObj);

    multiSelectedLayerIds.forEach((id) => {
      removeItemFromTree(id);
    });

    setLayerTree((prev) => [folderId, ...prev]);
    setMultiSelectedLayerIds(new Set());
    setFocusedLayerId(null);

    pushSnapshot();
    forceUpdateLayers();
  };

  const alignSelectedLayers = (alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') => {
    if (multiSelectedLayerIds.size < 2) return;

    const points: any[] = [];
    multiSelectedLayerIds.forEach((id) => {
      const layer = layerMapRef.current.get(id);
      if (layer && layer.overlay && layer.overlay.getPosition) {
        const pos = layer.overlay.getPosition();
        if (pos) points.push({ id, layer, lng: pos.lng, lat: pos.lat });
      }
    });

    if (points.length < 2) {
      alert('选中的图层中包含非点位类型，暂时仅支持点位/标记类型的对齐！');
      return;
    }

    let targetVal = 0;
    if (alignment === 'left') targetVal = Math.min(...points.map((p) => p.lng));
    else if (alignment === 'right') targetVal = Math.max(...points.map((p) => p.lng));
    else if (alignment === 'top') targetVal = Math.max(...points.map((p) => p.lat));
    else if (alignment === 'bottom') targetVal = Math.min(...points.map((p) => p.lat));
    else if (alignment === 'centerX') targetVal = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
    else if (alignment === 'centerY') targetVal = points.reduce((sum, p) => sum + p.lat, 0) / points.length;

    points.forEach((p) => {
      let newLng = p.lng;
      let newLat = p.lat;
      if (alignment === 'left' || alignment === 'right' || alignment === 'centerX') newLng = targetVal;
      if (alignment === 'top' || alignment === 'bottom' || alignment === 'centerY') newLat = targetVal;

      p.layer.overlay.setPosition([newLng, newLat]);
      if (p.layer.data.location) p.layer.data.location = [newLng, newLat];

      if (p.layer.data.type === 'station' || p.layer.data.type === 'point') renderSinglePointLayerInternal(p.id);
      else if (p.layer.data.type === 'text') renderTextLayerInternal(p.id);
    });

    pushSnapshot();
    forceUpdateLayers();
  };

  // Node Selection mode
  const startBoxSelectNodesMode = () => {
    if (!focusedLayerId) return;
    const layer = layerMapRef.current.get(focusedLayerId);
    if (!layer || (layer.data.type !== 'line' && layer.data.type !== 'pen')) {
      alert('请先选择并开启线路或钢笔图层的地图编辑！');
      return;
    }

    setIsBoxSelectingNodes(true);
    if (mapInstance) {
      mapInstance.setStatus({ scrollWheel: true, dragEnable: true });
    }
  };

  const exitBoxSelectNodesMode = () => {
    setIsBoxSelectingNodes(false);
    if (tempNodeMarkersRef.current.length > 0 && mapInstance) {
      mapInstance.remove(tempNodeMarkersRef.current);
      tempNodeMarkersRef.current = [];
    }
    selectedNodeIndicesSetRef.current.clear();
    forceUpdateLayers();
  };

  const calculateSelectedNodesInBox = (minX: number, maxX: number, minY: number, maxY: number) => {
    if (!focusedLayerId || !mapInstance) return;
    const layer = layerMapRef.current.get(focusedLayerId);
    if (!layer) return;

    const path = layer.overlay.getPath();
    const containerRect = mapInstance.getContainer().getBoundingClientRect();

    const boxSet = new Set<number>();
    path.forEach((lngLat: any, idx: number) => {
      const px = mapInstance.lngLatToContainer(lngLat);
      const screenX = px.x + containerRect.left;
      const screenY = px.y + containerRect.top;

      if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
        boxSet.add(idx);
      }
    });

    if (nodeSelectMode === 'replace') {
      selectedNodeIndicesSetRef.current = boxSet;
    } else if (nodeSelectMode === 'add') {
      boxSet.forEach((idx) => selectedNodeIndicesSetRef.current.add(idx));
    } else if (nodeSelectMode === 'subtract') {
      boxSet.forEach((idx) => selectedNodeIndicesSetRef.current.delete(idx));
    }

    renderNodeMarkers(path);
    forceUpdateLayers();
  };

  const renderNodeMarkers = (path: any[]) => {
    if (tempNodeMarkersRef.current.length > 0 && mapInstance) {
      mapInstance.remove(tempNodeMarkersRef.current);
      tempNodeMarkersRef.current = [];
    }

    const windowAMap = (window as any).AMap;
    if (!windowAMap || !mapInstance) return;

    selectedNodeIndicesSetRef.current.forEach((idx) => {
      if (path[idx]) {
        const lngLat = path[idx];
        const marker = new windowAMap.Marker({
          position: [lngLat.lng, lngLat.lat],
          content: `<div style="width:12px; height:12px; background:#ff3b30; border:2px solid #fff; border-radius:50%; box-shadow:0 0 6px rgba(255,59,48,0.8);"></div>`,
          anchor: 'center',
          zIndex: 200,
        });
        mapInstance.add(marker);
        tempNodeMarkersRef.current.push(marker);
      }
    });
  };

  const deleteSelectedNodes = () => {
    if (!focusedLayerId || selectedNodeIndicesSetRef.current.size === 0) {
      alert('未选中任何节点');
      return;
    }

    const layer = layerMapRef.current.get(focusedLayerId);
    if (!layer) return;

    let path = layer.overlay.getPath().map((p: any) => [p.lng, p.lat]);
    const sortedIndices = (Array.from(selectedNodeIndicesSetRef.current) as number[]).sort((a, b) => b - a);
    sortedIndices.forEach((idx) => {
      path.splice(idx, 1);
    });

    if (path.length < 2) {
      alert('线路节点数量过少（少于2个），无法构成路线！');
      return;
    }

    layer.overlay.setPath(path);
    if (layer.isEditing && layer.editor) {
      layer.editor.close();
      layer.editor.open();
    }

    exitBoxSelectNodesMode();
    renderStationElementsInternal(focusedLayerId);
    pushSnapshot();
    forceUpdateLayers();
  };

  const copySelectedNodesToNewLayer = () => {
    if (!focusedLayerId || selectedNodeIndicesSetRef.current.size < 2) {
      alert('框选选中的节点数不足2个，无法创建新钢笔图层！');
      return;
    }

    const layer = layerMapRef.current.get(focusedLayerId);
    if (!layer) return;

    const path = layer.overlay.getPath();
    const selectedPath = (Array.from(selectedNodeIndicesSetRef.current) as number[])
      .sort((a, b) => a - b)
      .map((idx: any) => [path[idx].lng, path[idx].lat]);

    const newId = 'pen_' + Date.now();
    const newItem: LayerItemData = {
      id: newId,
      name: `${layer.data.name} (复制脊线)`,
      sub: '框选节点生成的切片钢笔图层',
      category: '绘制',
      iconClass: 'fa-solid fa-pen-nib',
      iconBgClass: 'icon-line',
      type: 'pen',
      path: selectedPath as any,
    };

    addLayerToMapInternal(newItem, true);
    exitBoxSelectNodesMode();
    selectLayer(newId);
  };

  // Export JSON
  const exportJSONData = (filename?: string) => {
    const layersData: any[] = [];

    layerMapRef.current.forEach((layer) => {
      let overlayPath = null;
      let overlayCenter = null;
      let overlayRadius = null;
      let position = null;

      if (layer.overlay.getPath) {
        const p = layer.overlay.getPath();
        overlayPath = p ? p.map((pt: any) => [pt.lng, pt.lat]) : null;
      }
      if (layer.overlay.getCenter) {
        const c = layer.overlay.getCenter();
        overlayCenter = c ? [c.lng, c.lat] : null;
      }
      if (layer.overlay.getRadius) {
        overlayRadius = layer.overlay.getRadius();
      }
      if (layer.overlay.getPosition) {
        const pos = layer.overlay.getPosition();
        position = pos ? [pos.lng, pos.lat] : null;
      }

      if (!position && layer.data.location) {
        position = layer.data.location;
      }

      layersData.push({
        id: layer.data.id,
        data: layer.data,
        style: layer.style,
        stationStyle: layer.stationStyle,
        singlePointStyle: layer.singlePointStyle,
        shapeStyle: layer.shapeStyle,
        imageStyle: layer.imageStyle,
        penStyle: layer.penStyle,
        textStyle: layer.textStyle,
        stopOverrides: Array.from(layer.stopOverrides.entries()),
        rotation: layer.rotation || 0,
        flipX: !!layer.flipX,
        flipY: !!layer.flipY,
        visible: layer.visible,
        locked: layer.locked,
        overlayPath,
        overlayCenter,
        overlayRadius,
        position,
      });
    });

    const center = mapInstance ? mapInstance.getCenter() : { lng: 116.397428, lat: 39.90923 };
    const zoom = mapInstance ? mapInstance.getZoom() : 12;
    const rotation = mapInstance ? mapInstance.getRotation() : 0;

    const exportObj = {
      version: '2.2',
      exportTime: new Date().toISOString(),
      mapConfig: {
        center: [center.lng, center.lat],
        zoom,
        rotation,
        style: currentMapStyle,
      },
      globalTextConfig,
      city: currentCity,
      layerTree,
      folders: Array.from(folderMapRef.current.entries()),
      layers: layersData,
    };

    const finalName = filename || `map_draw_export_${Date.now()}`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${finalName}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    setIsExportModalOpen(false);
  };

  const importJSONData = (importedData: any) => {
    if (!importedData) return;

    layerMapRef.current.forEach((layer) => {
      if (layer.labelMarkers) mapInstance.remove(layer.labelMarkers);
      if (layer.stationMarkers) mapInstance.remove(layer.stationMarkers);
      if (layer.endpointMarkers) mapInstance.remove(layer.endpointMarkers);
      mapInstance.remove(layer.overlay);
    });
    layerMapRef.current.clear();
    folderMapRef.current.clear();

    if (importedData.mapConfig && mapInstance) {
      if (importedData.mapConfig.center) mapInstance.setCenter(importedData.mapConfig.center);
      if (importedData.mapConfig.zoom) mapInstance.setZoom(importedData.mapConfig.zoom);
      if (importedData.mapConfig.rotation !== undefined) mapInstance.setRotation(importedData.mapConfig.rotation);
      if (importedData.mapConfig.style) applyMapTheme(importedData.mapConfig.style);
    }

    if (importedData.globalTextConfig) {
      setGlobalTextConfig(importedData.globalTextConfig);
    }

    if (importedData.folders) {
      importedData.folders.forEach(([fId, fObj]: [string, any]) => folderMapRef.current.set(fId, fObj));
    }
    if (importedData.layerTree) {
      setLayerTree(importedData.layerTree);
    }

    if (Array.isArray(importedData.layers)) {
      importedData.layers.forEach((item: any) => {
        if (item.overlayPath) item.data.path = item.overlayPath;
        if (item.position) item.data.location = item.position;
        if (item.overlayRadius !== null && item.overlayRadius !== undefined) item.data.radius = item.overlayRadius;

        addLayerToMapInternal(item.data, false);
        const layer = layerMapRef.current.get(item.id);
        if (layer) {
          if (item.style) layer.style = item.style;
          if (item.stationStyle) layer.stationStyle = item.stationStyle;
          if (item.singlePointStyle) layer.singlePointStyle = item.singlePointStyle;
          if (item.shapeStyle) layer.shapeStyle = item.shapeStyle;
          if (item.imageStyle) layer.imageStyle = item.imageStyle;
          if (item.penStyle) layer.penStyle = item.penStyle;
          if (item.textStyle) layer.textStyle = item.textStyle;
          if (item.stopOverrides) layer.stopOverrides = new Map(item.stopOverrides);
          layer.rotation = item.rotation || 0;
          layer.flipX = !!item.flipX;
          layer.flipY = !!item.flipY;
          layer.visible = item.visible !== undefined ? item.visible : true;
          layer.locked = item.locked !== undefined ? item.locked : false;

          if (item.overlayPath && layer.overlay.setPath) layer.overlay.setPath(item.overlayPath);
          if (item.overlayCenter && layer.overlay.setCenter) layer.overlay.setCenter(item.overlayCenter);
          if (item.overlayRadius && layer.overlay.setRadius) layer.overlay.setRadius(item.overlayRadius);
          if (item.position && layer.overlay.setPosition) layer.overlay.setPosition(item.position);

          if (item.data.type === 'station' || item.data.type === 'point') renderSinglePointLayerInternal(item.id);
          else if (item.data.type === 'line') renderStationElementsInternal(item.id);
          else if (item.data.type === 'image') renderImageLayerInternal(item.id);
          else if (item.data.type === 'text') renderTextLayerInternal(item.id);

          const visibilityMethod = layer.visible ? 'show' : 'hide';
          layer.overlay[visibilityMethod]?.();
          layer.labelMarkers?.forEach((marker) => marker[visibilityMethod]?.());
          layer.stationMarkers?.forEach((marker) => marker[visibilityMethod]?.());
          layer.endpointMarkers?.forEach((marker) => marker[visibilityMethod]?.());

          applyLayerDraggableStateInternal(layer);
          applyLayerTransformsInternal(layer);
        }
      });
    }

    pushSnapshot();
    forceUpdateLayers();
    persistState();
  };

  return (
    <MapContext.Provider
      value={{
        mapInstance,
        setMapInstance,
        mouseTool,
        setMouseTool,
        layerTree,
        setLayerTree,
        folderMap: folderMapRef.current,
        layerMap: layerMapRef.current,
        focusedLayerId,
        setFocusedLayerId,
        multiSelectedLayerIds,
        setMultiSelectedLayerIds,
        rightClickedLayerId,
        setRightClickedLayerId,
        copiedStyleData,
        globalTextConfig,
        setGlobalTextConfig,
        updateGlobalTextConfig,
        customFonts,
        addCustomFont,
        removeCustomFont,
        currentCity,
        setCurrentCity,
        selectCity,
        currentMapStyle,
        applyMapTheme,
        activeCoreFeatures,
        toggleFeatureGroup,
        applyPreset,
        customPresets,
        saveNewPreset,
        deletePreset,
        currentActiveTool,
        activateDrawTool,
        deactivateDrawTools,
        mouseInteractionMode,
        setMouseInteractionMode,
        isSpacePressed,
        selectLayersInBox,
        pendingUploadedImageUrl,
        setPendingUploadedImageUrl,
        isPureMap,
        togglePureMapMode,
        isCityPanelOpen,
        setIsCityPanelOpen,
        isSearchPanelOpen,
        setIsSearchPanelOpen,
        isLayerPanelOpen,
        setIsLayerPanelOpen,
        isInspectorPanelOpen,
        setIsInspectorPanelOpen,
        isStylePanelOpen,
        setIsStylePanelOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        contextMenuPos,
        setContextMenuPos,
        canUndo,
        canRedo,
        undo,
        redo,
        pushSnapshot,
        addLayerFromSearch,
        addLayerToMap,
        removeLayerFromMap,
        selectLayer,
        toggleLayerVisibility,
        toggleLayerLock,
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
        renderStationElements: renderStationElementsInternal,
        renderSinglePointLayer: renderSinglePointLayerInternal,
        renderTextLayer: renderTextLayerInternal,
        renderImageLayer: renderImageLayerInternal,
        copyLayerStyle,
        pasteLayerStyle,
        createNewFolder,
        toggleFolderCollapse,
        toggleFolderVisibility,
        deleteFolder,
        groupSelectedLayers,
        alignSelectedLayers,
        isBoxSelectingNodes,
        nodeSelectMode,
        setNodeSelectMode,
        selectedNodeIndicesSet: selectedNodeIndicesSetRef.current,
        startBoxSelectNodesMode,
        exitBoxSelectNodesMode,
        deleteSelectedNodes,
        copySelectedNodesToNewLayer,
        calculateSelectedNodesInBox,
        activeColorPickerTarget,
        openDevToolsColorPicker,
        closeDevToolsColorPicker,
        addCustomDrawOverlayToLayer,
        exportJSONData,
        importJSONData,
        forceUpdateLayers,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
