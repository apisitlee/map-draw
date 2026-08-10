import React, { useEffect } from 'react';
import { useMap } from '../context/MapContext';
import { Copy, Clipboard, Trash2 } from 'lucide-react';

export const ContextMenu: React.FC = () => {
  const {
    contextMenuPos,
    setContextMenuPos,
    copyLayerStyle,
    pasteLayerStyle,
    rightClickedLayerId,
    folderMap,
    layerMap,
    deleteFolder,
    removeLayerFromMap,
    focusedLayerId,
    setFocusedLayerId,
  } = useMap();

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenuPos(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [setContextMenuPos]);

  if (!contextMenuPos) return null;

  const handleDelete = () => {
    if (rightClickedLayerId) {
      if (folderMap.has(rightClickedLayerId)) {
        deleteFolder(rightClickedLayerId);
      } else {
        const layer = layerMap.get(rightClickedLayerId);
        if (layer && layer.locked) {
          alert('该图层已被锁定，不可删除！');
          return;
        }
        removeLayerFromMap(rightClickedLayerId);
        if (focusedLayerId === rightClickedLayerId) setFocusedLayerId(null);
      }
    }
    setContextMenuPos(null);
  };

  return (
    <div
      className="fixed z-[1000] bg-white/95 backdrop-blur-xl rounded-xl border border-black/10 shadow-2xl p-1 min-w-[140px] flex flex-col gap-0.5"
      style={{ top: `${contextMenuPos.y}px`, left: `${contextMenuPos.x}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="px-2.5 py-1.5 text-xs font-medium text-[#1c1c1e] rounded-lg cursor-pointer flex items-center justify-between hover:bg-[#007AFF]/10 hover:text-[#007AFF] transition-colors"
        onClick={copyLayerStyle}
      >
        <span className="flex items-center gap-1.5">
          <Copy className="w-3.5 h-3.5" /> 复制样式
        </span>
      </div>

      <div
        className="px-2.5 py-1.5 text-xs font-medium text-[#1c1c1e] rounded-lg cursor-pointer flex items-center justify-between hover:bg-[#007AFF]/10 hover:text-[#007AFF] transition-colors"
        onClick={pasteLayerStyle}
      >
        <span className="flex items-center gap-1.5">
          <Clipboard className="w-3.5 h-3.5" /> 粘贴样式
        </span>
      </div>

      <div className="h-[1px] bg-black/8 my-1" />

      <div
        className="px-2.5 py-1.5 text-xs font-medium text-[#ff3b30] rounded-lg cursor-pointer flex items-center justify-between hover:bg-[#ff3b30]/10 transition-colors"
        onClick={handleDelete}
      >
        <span className="flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> 删除图层/文件夹
        </span>
        <span className="text-[10px] opacity-60">⌫</span>
      </div>
    </div>
  );
};
