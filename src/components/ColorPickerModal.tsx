import React, { useState, useEffect } from 'react';
import { useMap } from '../context/MapContext';
import { Palette, X } from 'lucide-react';

const PRESET_COLORS = [
  '#007AFF',
  '#34C759',
  '#FF9500',
  '#FF3B30',
  '#5856D6',
  '#AF52DE',
  '#FF2D55',
  '#5AC8FA',
  '#000000',
  '#8E8E93',
  '#E5E5EA',
  '#FFFFFF',
];

export const ColorPickerModal: React.FC = () => {
  const { activeColorPickerTarget, closeDevToolsColorPicker } = useMap();
  const [currentColor, setCurrentColor] = useState('#007AFF');
  const [recentColors, setRecentColors] = useState<string[]>([
    '#007AFF',
    '#34C759',
    '#FF9500',
    '#FF3B30',
    '#5856D6',
    '#AF52DE',
    '#1C1C1E',
    '#FFFFFF',
  ]);

  useEffect(() => {
    if (activeColorPickerTarget) {
      setCurrentColor(activeColorPickerTarget.currentColor || '#007AFF');
    }
  }, [activeColorPickerTarget]);

  if (!activeColorPickerTarget) return null;

  const handleSelectColor = (color: string) => {
    const uppercase = color.toUpperCase();
    setCurrentColor(uppercase);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toUpperCase() !== uppercase);
      return [uppercase, ...filtered].slice(0, 10);
    });
    activeColorPickerTarget.callback(uppercase);
  };

  const rect = activeColorPickerTarget.triggerElem
    ? activeColorPickerTarget.triggerElem.getBoundingClientRect()
    : { top: 100, left: 100 };

  const styleTop = Math.min(rect.top + window.scrollY + 28, window.innerHeight - 240);
  const styleLeft = Math.min(Math.max(10, rect.left), window.innerWidth - 240);

  return (
    <>
      {/* Backdrop to close when clicking outside */}
      <div className="fixed inset-0 z-[2499]" onClick={closeDevToolsColorPicker} />

      {/* Popover */}
      <div
        className="fixed z-[2500] bg-white/98 backdrop-blur-xl rounded-xl border border-black/12 shadow-2xl p-2.5 w-[220px] flex flex-col gap-2 transition-all select-none"
        style={{ top: `${styleTop}px`, left: `${styleLeft}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-0.5">
          <span className="text-[11px] font-semibold text-[#1c1c1e] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#007AFF]" /> 颜色选择
          </span>
          <button
            className="w-5 h-5 rounded-full hover:bg-black/5 text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors"
            onClick={closeDevToolsColorPicker}
            title="关闭 (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            className="border-none w-8 h-8 cursor-pointer bg-transparent rounded-md shrink-0"
          />
          <input
            type="text"
            value={currentColor}
            onChange={(e) => {
              let val = e.target.value.trim();
              if (!val.startsWith('#')) val = '#' + val;
              if (/^#[0-9A-F]{6}$/i.test(val)) {
                handleSelectColor(val);
              } else {
                setCurrentColor(val);
              }
            }}
            className="flex-1 px-2 py-1 rounded-md border border-[#d1d1d6] text-xs font-mono uppercase outline-none focus:border-[#007AFF]"
          />
        </div>

        <div className="text-[10px] font-semibold text-[#8e8e93] mt-0.5">预设颜色</div>
        <div className="grid grid-cols-6 gap-1">
          {PRESET_COLORS.map((c) => (
            <div
              key={c}
              className="w-6 h-6 rounded border border-black/15 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              onClick={() => handleSelectColor(c)}
            />
          ))}
        </div>

        <div className="text-[10px] font-semibold text-[#8e8e93] mt-0.5">用户历史颜色</div>
        <div className="grid grid-cols-6 gap-1">
          {recentColors.map((c, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded border border-black/15 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              onClick={() => handleSelectColor(c)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
