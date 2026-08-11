import React, { useEffect } from 'react';
import { MapProvider, useMap } from './context/MapContext';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { CityPanel } from './components/CityPanel';
import { SearchPanel } from './components/SearchPanel';
import { LayerPanel } from './components/LayerPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { StylePanel } from './components/StylePanel';
import { ExportModal } from './components/ExportModal';
import { ContextMenu } from './components/ContextMenu';
import { ColorPickerModal } from './components/ColorPickerModal';

const MapAppContent: React.FC = () => {
  const {
    setIsCityPanelOpen,
    isSearchPanelOpen,
    setIsSearchPanelOpen,
    setIsExportModalOpen,
    deactivateDrawTools,
    exitBoxSelectNodesMode,
    closeDevToolsColorPicker,
    isPureMap,
    togglePureMapMode,
    focusedLayerId,
    multiSelectedLayerIds,
    setMultiSelectedLayerIds,
    removeLayerFromMap,
    layerMap,
    setFocusedLayerId,
    undo,
    redo,
  } = useMap();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo Shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // Search shortcut (⌘K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!isPureMap) {
          setIsSearchPanelOpen(!isSearchPanelOpen);
        }
      }

      // ESC key to close floating panels & tools
      if (e.key === 'Escape') {
        setIsCityPanelOpen(false);
        deactivateDrawTools();
        setIsExportModalOpen(false);
        exitBoxSelectNodesMode();
        closeDevToolsColorPicker();
        if (isPureMap) togglePureMapMode();
      }

      // Delete / Backspace key to remove selected layers
      if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        (focusedLayerId || multiSelectedLayerIds.size > 0)
      ) {
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement)?.tagName)) {
          e.preventDefault();
          if (multiSelectedLayerIds.size > 0) {
            multiSelectedLayerIds.forEach((id) => removeLayerFromMap(id));
            setMultiSelectedLayerIds(new Set());
            setFocusedLayerId(null);
          } else if (focusedLayerId) {
            const layer = layerMap.get(focusedLayerId);
            if (layer && !layer.locked) {
              removeLayerFromMap(focusedLayerId);
              setFocusedLayerId(null);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPureMap,
    focusedLayerId,
    multiSelectedLayerIds,
    undo,
    redo,
    deactivateDrawTools,
    exitBoxSelectNodesMode,
    closeDevToolsColorPicker,
    togglePureMapMode,
    removeLayerFromMap,
    setIsCityPanelOpen,
    setIsExportModalOpen,
    isSearchPanelOpen,
    setIsSearchPanelOpen,
    setFocusedLayerId,
    setMultiSelectedLayerIds,
    layerMap,
  ]);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#f2f2f7] select-none font-sans">
      <Header />

      <main className="flex-1 w-full relative overflow-hidden">
        <MapCanvas />
        <CityPanel />
        <SearchPanel />
        <LayerPanel />
        <InspectorPanel />
        <StylePanel />
      </main>

      <ExportModal />
      <ContextMenu />
      <ColorPickerModal />
    </div>
  );
};

export default function App() {
  return (
    <MapProvider>
      <MapAppContent />
    </MapProvider>
  );
}
