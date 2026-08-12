import React, { useState } from 'react';
import { useMap } from '../context/MapContext';
import {
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
  Type,
  ChevronRight,
  ChevronDown,
  SquareDashed,
  RectangleHorizontal,
} from 'lucide-react';
import { LayerType } from '../types';

export const FilePanel: React.FC = () => {
  const {
    openedLeftPanel,
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

  if (openedLeftPanel !== 'file' || isPureMap) return null;

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'line':
      case 'pen':
        return <Route className="w-3.5 h-3.5" />;
      case 'station':
        return <Bus className="w-3.5 h-3.5" />;
      case 'rectangle':
        return <RectangleHorizontal className="w-3.5 h-3.5" />;
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

  const renderTreeNodes = (nodes: string[], indent: number = 0) => {
    const plCalc = `${16 + 16 * indent}px`;
    const plItemCalc = `${16 + 16 * indent}px`;
    return nodes.map((id) => {
      if (folderMap.has(id)) {
        const folder = folderMap.get(id)!;
        const isDragOver = dragOverFolderId === folder.id;

        return (
          <div key={folder.id} className="jio">
            <div
              className={`group/folder flex items-center justify-between pr-1.5 py-0.5 transition-all cursor-pointer ${isDragOver
                ? 'bg-[#007AFF]/15'
                : 'hover:bg-black/10'
                }`}
              style={{ 'paddingLeft': plCalc }}
              onContextMenu={(e) => handleContextMenu(e, folder.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverFolderId(folder.id);
              }}
              onDragLeave={() => setDragOverFolderId(null)}
              onDrop={(e) => handleDropOnFolder(e, folder.id)}
            >
              <button className="w-4 h-4 flex items-center justify-center shrink-0 text-xs -ml-[16px]" onClick={(e) => toggleFolderCollapse(folder.id, e)}>
                <ChevronDown className={`w-[8px] h-[8px] opacity-60 text-xs ${folder.collapsed ? '-rotate-90' : ''}`} />
              </button>
              <div className="flex items-center gap-1.5 flex-1">
                {/* <GripVertical className="w-3 h-3 text-[#c7c7cc] shrink-0" /> */}
                <SquareDashed className="w-4 h-4 shrink-0 text-[#999]" />
                <span className="text-xs text-[#1c1c1e] truncate">{folder.name}</span>
              </div>

              <div className="flex items-center gap-0.5 opacity-80 hover:opacity-100 invisible group-hover/folder:visible" onClick={(e) => e.stopPropagation()}>
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
              <>
                {renderTreeNodes(folder.children, indent + 1)}
              </>
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
            className={`group/item flex items-center justify-between px-1.5 py-0.5 transition-all cursor-pointer select-none ${!visible ? 'opacity-50 bg-black/5' : ''
              } ${locked ? 'bg-black/10 cursor-not-allowed' : 'hover:bg-black/10'} ${isMulti || isFocused ? 'bg-[#007AFF]/10 text-black' : 'text-[#1c1c1e]'
              }`}
            style={{ 'paddingLeft': plItemCalc }}
            onClick={(e) => selectLayer(id, e)}
            onContextMenu={(e) => handleContextMenu(e, id)}
          >
            <button className="w-4 h-4 bg-[orange] flex items-center justify-center shrink-0 text-xs -ml-[14px] invisible">
              <ChevronDown className={`w-[8px] h-[8px] bg-[red] opacity-60 text-xs`} />
            </button>
            <div className={`flex items-center gap-1.5 flex-1 overflow-hidden`}>
              {/* <GripVertical className="w-3 h-3 text-[#c7c7cc] shrink-0" /> */}
              <div
                className={`w-4 h-4 flex items-center justify-center text-xs shrink-0 ${isFocused ? 'text-[#1c1c1e]' : 'text-[#999]'}`}
              >
                {getLayerIcon(data.type)}
              </div>
              <span className="text-xs truncate max-w-[120px]">{data.name}</span>
            </div>

            <div className="flex items-center gap-0.5 opacity-80 hover:opacity-100 invisible group-hover/item:visible" onClick={(e) => e.stopPropagation()}>
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
    openedLeftPanel === 'file' && (<div className="absolute top-0 left-[55px] w-[290px] h-[100vh] bg-white border-r border-black/20 z-20 flex flex-col transition-all">
      <header className="w-full py-3 px-3 border-b border-black/5 rounded-md">
        <div className="group flex items-stretch justify-between transition-all rounded-md">
          <span className="h-6 flex-1 w-full bg-transparent border border-transparent focus:outline-none group-hover:bg-black/5 hover:bg-black/10 rounded-l-md text-sm font-semibold px-2 whitespace-nowrap overflow-hidden text-ellipsis">新文件发生地方撒发生范德萨v饭打扫额外积分呢，吗，</span>
          <input className="peer h-6 flex-1 bg-transparent border border-transparent focus:outline-none group-hover:bg-black/5 hover:bg-black/10 rounded-l-md text-sm font-semibold px-2 focus:border-[#007AFF] focus:rounded-md focus:bg-transparent hidden" />
          <button className="shrink-0 group-hover:bg-black/5 hover:bg-black/10 rounded-r-md w-6 flex items-center justify-center peer-focus:hidden">
            <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93]" />
          </button>
        </div>
      </header>

      <div className="flex items-center justify-start text-xs py-1 px-2.5">
        <ChevronRight className="w-3 h-3 text-[#8e8e93] mr-1" />
        <ChevronDown className="w-3 h-3 text-[#8e8e93] mr-1" />
        <span>图层</span>
      </div>

      <div className="py-3 pl-4 pr-3 overflow-y-auto flex-1">
        {layerTree.length > 0 && (
          renderTreeNodes(layerTree)
        )}
      </div>
    </div>)
  );
};
