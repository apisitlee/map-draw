import React, { useEffect } from 'react';
import { MapProvider, useMap } from './context/MapContext';
import { DialogProvider } from './context/DialogContext';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { CityPanel } from './components/CityPanel';
import { SearchPanel } from './components/SearchPanel';
import { FilePanel } from './components/FilePanel';
import { InspectorPanel } from './components/InspectorPanel';
import { SettingPanel } from './components/SettingPanel';
import { ExportModal } from './components/ExportModal';
import { ContextMenu } from './components/ContextMenu';
import { ColorPickerModal } from './components/ColorPickerModal';
import { AssetPanel } from './components/AssetPanel';
// 在 App.tsx 顶部添加路由所需的引入
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
// 引入新建的页面组件
import { Home } from './pages/Home';
import { Drafts } from './pages/Drafts';
import { Workspaces } from './pages/Workspaces';
import { ProjectDetails } from './pages/ProjectDetails';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Trash } from './pages/Trash';
import { Help } from './pages/Help';
import { SidebarLayout } from './layouts/SidebarLayout';

// 简易的路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasToken = localStorage.getItem('token') !== null;

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const MapAppContent: React.FC = () => {
  const {
    setIsCityPanelOpen,
    openedLeftPanel,
    setOpenedLeftPanel,
    isInspectorPanelOpen,
    setIsInspectorPanelOpen,
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

      // Switch left panels with option and keys (1, 2, Comma)
      if (e.altKey) {
        e.preventDefault();
        switch (e.code) {
          case 'Digit1':
            setOpenedLeftPanel(openedLeftPanel === 'file' ? null : 'file');
            break;
          case 'Digit2':
            setOpenedLeftPanel(openedLeftPanel === 'asset' ? null : 'asset');
            break;
          case 'Comma':
            setOpenedLeftPanel(openedLeftPanel === 'setting' ? null : 'setting');
            break;
          case 'KeyI':
            setIsInspectorPanelOpen(!isInspectorPanelOpen);
            break;
          case 'KeyF':
            togglePureMapMode();
            break;
          default:
            break;
        }
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
    setOpenedLeftPanel,
  ]);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#f2f2f7] select-none font-sans">
      <Header />

      <main className="flex-1 w-full relative overflow-hidden">
        <MapCanvas />
        <CityPanel />
        <SearchPanel />
        <FilePanel />
        <AssetPanel />
        <InspectorPanel />
        <SettingPanel />
      </main>

      <ExportModal />
      <ContextMenu />
      <ColorPickerModal />
    </div>
  );
};

// 创建一个专用的包装组件，用于给地图路由注入 MapProvider 并获取 URL 参数
const MapEditorRoute: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();

  // 你未来可以在这里通过 fileId 向后端请求地图数据
  console.log("当前加载的地图 ID:", fileId);

  return (
    <MapProvider>
      <MapAppContent />
    </MapProvider>
  );
};

export default function App() {
  return (
    <DialogProvider>
      <Router>
        <Routes>
          {/* 公共路由：无需登录 */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* 受保护的仪表盘路由（主页、项目详情共享 SidebarLayout） */}
          <Route
            element={
              <ProtectedRoute>
                <SidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/files/home" element={<Home />} />
            <Route path="/workspace" element={<Workspaces />} />
            <Route path="/files/drafts" element={<Drafts />} />
            <Route path="/files/trash" element={<Trash />} />
            <Route path="/project/:projectId" element={<ProjectDetails />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* 受保护的编辑器路由（独占全屏） */}
          <Route
            path="/file/:fileId"
            element={
              <ProtectedRoute>
                <MapEditorRoute />
              </ProtectedRoute>
            }
          />

          {/* 捕获所有未匹配的路由 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DialogProvider>
  );
}
