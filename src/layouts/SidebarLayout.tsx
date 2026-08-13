import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Trash2,
    Plus,
    Folder,
    Settings,
    Palette,
    HelpCircle,
    LogOut,
    ChevronUp,
    File,
    Clock,
    Inbox,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { Tooltip } from '../components/Tooltip';

export const SidebarLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });
    const [projectLogo, setProjectLogo] = useState<File | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    };

    const generateRandomColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('请上传 jpg, png 或 webp 格式的图片。');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过 2MB。');
                return;
            }
            setProjectLogo(file);
        }
    };

    const submitNewProject = () => {
        if (!newProjectData.name.trim()) {
            alert('项目名称为必填项！');
            return;
        }
        const finalProject = {
            name: newProjectData.name,
            description: newProjectData.description,
            logoFile: projectLogo,
            defaultColor: generateRandomColor() // 系统自动分配颜色
        };
        console.log('新建项目数据：', finalProject);
        setIsNewProjectModalOpen(false);
        // 重置状态...
    };

    const userMenuRef = useRef<HTMLDivElement>(null);

    // 模拟星标数据
    const starredFiles = [
        { id: 'file_0', name: 'file 0' }
    ];

    // 模拟项目列表数据
    const projects = [
        { id: 'proj_alpha', name: 'UI设计工作空间', parent_id: null },
        { id: 'proj_beta', name: '深色模式探索', parent_id: 'proj_alpha' },
    ];

    // 递归渲染文件夹树的辅助函数
    const renderFolderTree = (parentId: string | null = null, depth = 0) => {
        const children = projects.filter(p => p.parent_id === parentId);
        if (children.length === 0) return null;

        return (
            <div className="flex flex-col gap-1">
                {children.map(proj => {
                    const isExpanded = expandedFolders.has(proj.id);
                    const hasChildren = projects.some(p => p.parent_id === proj.id);
                    const isActive = location.pathname.includes(proj.id);

                    return (
                        <div key={proj.id} className="flex flex-col">
                            <button
                                onClick={() => navigate(`/project/${proj.id}`)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--text-sub)] hover:bg-black/5'}`}
                                style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
                            >
                                {/* 展开/收起图标 */}
                                {hasChildren ? (
                                    <span onClick={(e) => toggleFolder(e, proj.id)} className="cursor-pointer hover:bg-black/10 rounded p-0.5">
                                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </span>
                                ) : (
                                    <span className="w-4.5" /> // 占位符保持对齐
                                )}
                                <Folder className="w-4 h-4" />
                                {proj.name}
                            </button>
                            {/* 只有展开时才递归渲染子节点 */}
                            {isExpanded && renderFolderTree(proj.id, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuAction = (action: () => void) => {
        action();
        setIsUserMenuOpen(false);
    };

    return (
        <div className="flex h-screen w-screen bg-[var(--bg-base)] overflow-hidden font-sans select-none">
            {/* 左侧边栏 */}
            <aside className="w-64 bg-[var(--bg-panel)] border-r border-[var(--border-line)] flex flex-col justify-between h-full relative z-20">
                {/* 顶部区域 */}
                <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                    <div className="flex items-center gap-3 px-2 mb-6 cursor-pointer" onClick={() => navigate('/files/home')}>
                        <img src="/logo.png" alt="Map Draw Logo" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="font-bold text-lg text-[var(--text-main)]">Map Draw</span>
                    </div>

                    {/* 主菜单 */}
                    <button
                        onClick={() => navigate('/files/home')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/files/home') ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--text-sub)] hover:bg-black/5'}`}
                    >
                        <Clock className="w-4 h-4" /> 最近打开
                    </button>
                    <button
                        onClick={() => navigate('/files/drafts')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/files/drafts') ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--text-sub)] hover:bg-black/5'}`}
                    >
                        <Inbox className="w-4 h-4" /> 草稿箱
                    </button>
                    <button
                        onClick={() => navigate('/files/trash')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/files/trash') ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--text-sub)] hover:bg-black/5'}`}
                    >
                        <Trash2 className="w-4 h-4" /> 回收站
                    </button>

                    <div className="h-[1px] bg-black/10 my-2 mx-2" />

                    {/* 星标项目 */}
                    <div className="px-2 text-xs font-semibold text-[#8e8e93] mb-2 mt-2">星标</div>
                    <div className="flex flex-col gap-1">
                        {starredFiles.map(item => (
                            <button
                                key={item.id}
                                onClick={() => navigate(`/file/${item.id}`)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#3c3c43] hover:bg-black/5`}
                            >
                                <File className="w-4 h-4" /> {item.name}
                            </button>
                        ))}
                    </div>

                    {/* 工作空间 */}
                    <div className="px-2 text-xs font-semibold text-[var(--text-info)] mb-2 mt-2 flex items-center justify-between">
                        工作空间
                        <Tooltip content="新建文件夹" placement="bottom">
                            <button onClick={() => setIsNewProjectModalOpen(true)} className="hover:text-[var(--text-main)]">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </Tooltip>
                    </div>
                    {/* 渲染嵌套文件夹树 */}
                    {renderFolderTree(null)}
                </div>

                {/* 底部用户模块 */}
                <div className="p-4 border-t border-black/10 relative" ref={userMenuRef}>
                    {/* 用户弹出菜单 */}
                    {isUserMenuOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-black/10 p-1 z-50">
                            <button onClick={() => handleMenuAction(() => console.log('设置'))} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#3c3c43] hover:bg-black/5 transition-colors">
                                <Settings className="w-4 h-4" /> 设置
                            </button>
                            <button onClick={() => handleMenuAction(() => console.log('主题配置'))} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#3c3c43] hover:bg-black/5 transition-colors">
                                <Palette className="w-4 h-4" /> 外观
                            </button>
                            <button
                                onClick={() => handleMenuAction(() => navigate('/help'))}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#3c3c43] hover:bg-black/5 transition-colors"
                            >
                                <HelpCircle className="w-4 h-4" /> 帮助
                            </button>
                            <div className="h-[1px] bg-black/10 my-1 mx-2" />
                            <button
                                onClick={() => handleMenuAction(handleLogout)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#ff3b30] hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> 退出登录
                            </button>
                        </div>
                    )}

                    {/* 用户头像与昵称按钮 */}
                    <div
                        className="flex items-center justify-between p-2 hover:bg-black/5 rounded-xl cursor-pointer transition-colors"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        <div className="flex items-center gap-3">
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User Avatar" className="w-8 h-8 rounded-full bg-gray-200" />
                            <span className="text-sm font-medium text-[#1c1c1e]">User_1024</span>
                        </div>
                        <ChevronUp className={`w-4 h-4 text-[#8e8e93] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </aside>

            {/* 右侧内容区域 (Outlet 渲染具体的页面如 Home 或 ProjectDetails) */}
            <main className="flex-1 h-full overflow-y-auto relative">
                <Outlet />
            </main>

            {isNewProjectModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[var(--bg-panel)] w-96 rounded-2xl p-6 border border-[var(--border-line)]">
                        <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">新建项目</h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text" placeholder="项目名称 (必填)"
                                onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                                className="px-3 py-2 bg-[var(--bg-base)] text-[var(--text-main)] rounded-lg outline-none border border-[var(--border-line)] focus:border-[var(--theme-primary)]"
                            />
                            <textarea
                                placeholder="项目描述 (选填)"
                                onChange={e => setNewProjectData({ ...newProjectData, description: e.target.value })}
                                className="px-3 py-2 bg-[var(--bg-base)] text-[var(--text-main)] rounded-lg outline-none border border-[var(--border-line)] resize-none h-20"
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[var(--text-sub)]">项目标志 (选填, &lt;=2MB, jpg/png/webp)</label>
                                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleLogoUpload} className="text-sm text-[var(--text-sub)]" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsNewProjectModalOpen(false)} className="px-4 py-2 text-sm text-[var(--text-sub)] hover:text-white">取消</button>
                            <button onClick={submitNewProject} className="px-4 py-2 text-sm bg-[var(--theme-primary)] text-white rounded-lg">确认创建</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};