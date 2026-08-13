import React, { useState, useEffect, useRef } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 定义菜单项的接口配置
interface MenuItem {
    label: string;
    shortcut?: string;      // 新增：用于显示快捷键指示
    onClick?: () => void;
    hasSeparator?: boolean; // 新增：是否在当前菜单项下方添加分割线
    subMenu?: MenuItem[];   // 嵌套的子菜单数组
}

export const MainMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1); // 如果有来源页面，返回上一页
        } else {
            navigate('/files/home'); // 否则返回主页
        }
    };

    // 根据你的需求构建的多级菜单配置
    const menuConfig: MenuItem[] = [
        {
            label: '← 返回',
            hasSeparator: true,
            onClick: handleGoBack
        },
        {
            label: '文件',
            subMenu: [
                { label: '新建文件', shortcut: '⌘N', onClick: () => console.log('新建文件') },
                { label: '导入文件', onClick: () => console.log('导入文件') },
                { label: '创建文件副本', hasSeparator: true, onClick: () => console.log('创建文件副本') },
                { label: '保存本地文件', shortcut: '⌘S', onClick: () => console.log('保存本地文件') },
                { label: '添加到历史版本', onClick: () => console.log('添加到历史版本') },
                { label: '查看历史版本', hasSeparator: true, onClick: () => console.log('查看历史版本') },
                { label: '导出为图片', onClick: () => console.log('导出为图片') },
            ],
        },
        {
            label: '编辑',
            hasSeparator: true,
            subMenu: [
                { label: '撤销', shortcut: '⌘Z', onClick: () => console.log('撤销') },
                { label: '重做', shortcut: '⌘Y', hasSeparator: true, onClick: () => console.log('重做') },
                { label: '创建副本', shortcut: '⌘D', onClick: () => console.log('创建副本') },
                { label: '剪切', shortcut: '⌘X', onClick: () => console.log('剪切') },
                {
                    label: '复制',
                    subMenu: [
                        { label: '复制图层', shortcut: '⌘C', onClick: () => console.log('复制图层') },
                        { label: '复制文本内容', onClick: () => console.log('复制文本内容') },
                        { label: '复制样式', shortcut: '⌥⌘C', onClick: () => console.log('复制样式') },
                    ]
                },
                {
                    label: '粘贴',
                    subMenu: [
                        { label: '粘贴', shortcut: '⌘V', onClick: () => console.log('粘贴') },
                        { label: '粘贴并替换', shortcut: '⇧⌘R', onClick: () => console.log('粘贴并替换') },
                        { label: '粘贴样式', shortcut: '⌥⌘V', onClick: () => console.log('粘贴样式') },
                    ]
                },
                { label: '删除', shortcut: '⌫', hasSeparator: true, onClick: () => console.log('删除') },
                { label: '全选', shortcut: '⌘A', onClick: () => console.log('全选') },
                { label: '反选', shortcut: '⇧⌘A', onClick: () => console.log('反选') },
            ],
        },
        {
            label: '偏好设置',
            shortcut: '⌥,',
            onClick: () => console.log('偏好设置')
        },
        {
            label: '帮助',
            shortcut: '⌘H',
            onClick: () => console.log('帮助')
        },
    ];

    // 处理点击组件外部关闭菜单的逻辑
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 递归渲染菜单列表的函数
    const renderMenuItems = (items: MenuItem[], isSubMenu = false) => {
        return (
            <ul className={`py-1 ${isSubMenu ? 'min-w-[160px]' : 'min-w-[200px]'}`}>
                {items.map((item, index) => (
                    <li key={index} className={`relative ${isSubMenu ? 'group/sub' : 'group'} px-1`}>
                        <button
                            onClick={(e) => {
                                // 如果当前项有子菜单，则点击时不关闭面板
                                if (item.subMenu) {
                                    e.preventDefault();
                                    return;
                                }
                                if (item.onClick) {
                                    item.onClick();
                                    setIsOpen(false);
                                }
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-[#1c1c1e] rounded-md hover:bg-[#007AFF] hover:text-white transition-colors flex justify-between items-center"
                        >
                            <span>{item.label}</span>

                            {/* 右侧显示区域：快捷键或子菜单提示图标 */}
                            <div className="flex items-center gap-2">
                                {item.shortcut && (
                                    <span className={`text-[10px] opacity-60 tracking-wider font-sans ${isSubMenu ? 'group-hover/sub:opacity-100' : 'group-hover:opacity-100'} transition-opacity`}>
                                        {item.shortcut}
                                    </span>
                                )}
                                {item.subMenu && <ChevronRight className="w-3 h-3 opacity-60" />}
                            </div>
                        </button>

                        {/* 嵌套子菜单，利用 group-hover 在悬浮时展示在右侧侧边 */}
                        {item.subMenu && (
                            <div className={`absolute left-full top-0 hidden ${isSubMenu ? 'group-hover/sub:block' : 'group-hover:block'} pl-1 z-50`}>
                                <div className="bg-white border border-black/5 rounded-lg shadow-xl">
                                    {renderMenuItems(item.subMenu, true)}
                                </div>
                            </div>
                        )}

                        {/* 渲染下方的分割线 */}
                        {item.hasSeparator && (
                            <div className="my-1 border-b border-black/10 mx-2"></div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            {/* 唤起菜单的图标按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-lg hover:bg-black/5 text-[#1c1c1e] flex items-center justify-center text-xs cursor-pointer"
                aria-label="Main Menu"
            >
                <Menu className="w-4 h-4" />
            </button>

            {/* 弹出的菜单面板 */}
            {isOpen && (
                <div className="absolute left-0 mt-2 z-50 origin-top-left">
                    <div className="bg-white border border-black/5 rounded-xl shadow-2xl overflow-visible">
                        {renderMenuItems(menuConfig)}
                    </div>
                </div>
            )}
        </div>
    );
};