import React, { useState } from 'react';
import { useMap } from '../context/MapContext';
import { useDialog } from '../context/DialogContext';
import { Share, X, Code2, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, exportJSONData } = useMap();
  const { showAlert } = useDialog();
  const [filename, setFilename] = useState(`map_draw_export_${Date.now()}`);

  if (!isExportModalOpen) return null;

  const handleExportJSON = () => {
    exportJSONData(filename.trim() || `map_draw_export_${Date.now()}`);
  };

  const handleExportScreenshot = async () => {
    setIsExportModalOpen(false);
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    try {
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => element.classList.contains('amap-control-default'),
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename.trim() || 'map_draw_screenshot'}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Screenshot error:', err);
      showAlert('导出截图时遇到问题，部分瓦片跨域未响应。');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center transition-opacity">
      <div className="w-[380px] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 p-5 flex flex-col gap-4 transform transition-transform scale-100">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-[#1c1c1e] flex items-center gap-2">
            <Share className="w-5 h-5 text-[#007AFF]" />
            导出选项
          </span>
          <button
            className="w-7 h-7 rounded-full text-[#8e8e93] hover:bg-black/5 hover:text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer transition-all"
            onClick={() => setIsExportModalOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#3c3c43]">导出文件名（无须加后缀）：</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="输入导出文件名..."
            className="w-full px-2.5 py-2 rounded-lg border border-[#d1d1d6] text-xs outline-none focus:border-[#007AFF] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="border border-black/10 bg-white/80 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF] transition-all group"
            onClick={handleExportJSON}
          >
            <Code2 className="w-6 h-6 text-[#007AFF] group-hover:text-white transition-colors" />
            <span className="text-xs font-semibold">导出 JSON 数据</span>
          </div>

          <div
            className="border border-black/10 bg-white/80 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF] transition-all group"
            onClick={handleExportScreenshot}
          >
            <Camera className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" />
            <span className="text-xs font-semibold">保存地图截图</span>
          </div>
        </div>
      </div>
    </div>
  );
};
