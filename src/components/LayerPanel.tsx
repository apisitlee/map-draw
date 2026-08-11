import React, { useState } from 'react';
import { useMap } from '../context/MapContext';
import {
  Layers,
  X,
  FolderPlus,
  Folder,
  FolderOpen,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  GripVertical,
  MapPin,
  Route,
  Bus,
  Square,
  Circle,
  Shapes,
  Image as ImageIcon,
  PenTool,
  Type,
} from 'lucide-react';
import { LayerType } from '../types';

export const LayerPanel: React.FC = () => {
  const {
    isLayerPanelOpen,
    setIsLayerPanelOpen,
    layerTree,
    folderMap,
    layerMap,
    focusedLayerId,
    multiSelectedLayerIds,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    createNewFolder,
    toggleFolderCollapse,
    toggleFolderVisibility,
    setRightClickedLayerId,
    setContextMenuPos,
    isPureMap,
    setLayerTree,
    pushSnapshot,
  } = useMap();

  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  if (!isLayerPanelOpen || isPureMap) return null;

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'line':
      case 'pen':
        return <Route className="w-3.5 h-3.5" />;
      case 'station':
        return <Bus className="w-3.5 h-3.5" />;
      case 'rectangle':
        return <Square className="w-3.5 h-3.5" />;
      case 'circle':
        return <Circle className="w-3.5 h-3.5" />;
      case 'polygon':
        return <Shapes className="w-3.5 h-3.5" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5" />;
      case 'text':
        return <Type className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRightClickedLayerId(id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Helper to remove item from tree
  const removeFromTreeArray = (targetId: string, tree: string[]): string[] => {
    return tree.filter((id) => {
      if (id === targetId) return false;
      if (folderMap.has(id)) {
        const folder = folderMap.get(id)!;
        folder.children = removeFromTreeArray(targetId, folder.children);
      }
      return true;
    });
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== folderId) {
      setLayerTree((prev) => {
        const cleaned = removeFromTreeArray(draggedId, prev);
        const folder = folderMap.get(folderId);
        if (folder) {
          folder.children = [draggedId, ...folder.children.filter((c) => c !== draggedId)];
        }
        return [...cleaned];
      });
      pushSnapshot();
    }
  };

  const renderTreeNodes = (nodes: string[]) => {
    return nodes.map((id) => {
      if (folderMap.has(id)) {
        const folder = folderMap.get(id)!;
        const isDragOver = dragOverFolderId === folder.id;

        return (
          <div key={folder.id} className="mb-1">
            <div
              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${isDragOver
                ? 'bg-[#007AFF]/15 border-dashed border-[#007AFF]'
                : 'bg-black/5 hover:bg-black/10 border-black/5'
                }`}
              onClick={(e) => toggleFolderCollapse(folder.id, e)}
              onContextMenu={(e) => handleContextMenu(e, folder.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverFolderId(folder.id);
              }}
              onDragLeave={() => setDragOverFolderId(null)}
              onDrop={(e) => handleDropOnFolder(e, folder.id)}
            >
              <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                <GripVertical className="w-3 h-3 text-[#c7c7cc] shrink-0" />
                {folder.collapsed ? (
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-semibold text-[#1c1c1e] truncate">{folder.name}</span>
              </div>

              <div className="flex items-center gap-0.5 opacity-80 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                <button
                  className="w-6 h-6 rounded-md hover:bg-black/10 text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer"
                  onClick={() => createNewFolder(folder.id)}
                  title="在此新建子文件夹"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-6 h-6 rounded-md hover:bg-black/10 text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer"
                  onClick={(e) => toggleFolderVisibility(folder.id, e)}
                  title={folder.visible ? '隐藏' : '显示'}
                >
                  {folder.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              </div>
            </div>

            {/* Folder Children */}
            {!folder.collapsed && (
              <div className="pl-3.5 border-l-2 border-dashed border-black/10 ml-2.5 mt-1">
                {renderTreeNodes(folder.children)}
              </div>
            )}
          </div>
        );
      } else if (layerMap.has(id)) {
        const layer = layerMap.get(id)!;
        const { data, visible, locked } = layer;
        const isFocused = focusedLayerId === id;
        const isMulti = multiSelectedLayerIds.has(id);

        return (
          <div
            key={id}
            draggable={!locked}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
            className={`flex items-center justify-between p-1.5 mb-1 rounded-lg border transition-all cursor-pointer select-none ${!visible ? 'opacity-50 bg-black/5' : ''
              } ${locked ? 'bg-black/10 cursor-not-allowed' : 'hover:bg-black/10'} ${isFocused ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'text-[#1c1c1e] border-transparent'
              } ${isMulti ? 'bg-emerald-500/20 border-dashed border-emerald-500' : ''}`}
            onClick={(e) => selectLayer(id, e)}
            onContextMenu={(e) => handleContextMenu(e, id)}
          >
            <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
              <GripVertical className="w-3 h-3 text-[#c7c7cc] shrink-0" />
              <div
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 ${data.type === 'line' || data.type === 'pen'
                  ? 'bg-emerald-100 text-emerald-600'
                  : data.type === 'station'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-[#007AFF]'
                  }`}
              >
                {getLayerIcon(data.type)}
              </div>
              <span className="text-xs truncate max-w-[120px]">{data.name}</span>
            </div>

            <div className="flex items-center gap-0.5 opacity-80 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
              <button
                className={`w-6 h-6 rounded-md hover:bg-black/10 flex items-center justify-center text-xs cursor-pointer ${locked ? 'text-[#ff3b30]' : ''
                  }`}
                onClick={(e) => toggleLayerLock(id, e)}
                title={locked ? '解锁图层' : '锁定图层'}
              >
                {locked ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
              </button>
              <button
                className="w-6 h-6 rounded-md hover:bg-black/10 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer"
                onClick={(e) => toggleLayerVisibility(id, e)}
                title={visible ? '隐藏' : '显示'}
              >
                {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            </div>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="absolute top-[60px] left-4 w-[290px] max-h-[calc(100vh-120px)] bg-white/88 backdrop-blur-xl rounded-2xl shadow-xl border border-white/70 z-20 flex flex-col transition-all">
      <div className="p-3.5 flex items-center justify-between border-b border-black/5">
        <span className="text-xs font-semibold text-[#1c1c1e] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#007AFF]" />
          图层列表
        </span>
        <div className="flex items-center gap-1.5">
          <button
            className="px-2 py-1 text-[11px] rounded-md bg-[#007AFF] text-white hover:bg-[#0056b3] transition-colors flex items-center gap-1 cursor-pointer"
            onClick={() => createNewFolder()}
            title="新建文件夹组"
          >
            <FolderPlus className="w-3 h-3" /> 新建文件夹
          </button>
          <button
            className="w-6.5 h-6.5 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
            onClick={() => setIsLayerPanelOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 overflow-y-auto flex-1">
        {layerTree.length === 0 ? (
          <div className="text-[#8e8e93] text-center text-xs py-4">暂无图层</div>
        ) : (
          renderTreeNodes(layerTree)
        )}
      </div>
    </div>
  );
};
