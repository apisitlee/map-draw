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
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';

export const SidebarLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useDialog();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });
    const [projectLogo, setProjectLogo] = useState<File | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const [projects, setProjects] = useState<any[]>([]);
    const [starredFiles, setStarredFiles] = useState<any[]>([]);

    // 组件首次渲染时自动加载项目数据
    useEffect(() => {
        loadProjects();
        loadStarredFiles();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await api.getProjects();
            console.log("获取项目列表", data);
            setProjects(data);
        } catch (err: any) {
            showToast(err.message || '加载项目列表失败', 'error');
        }
    };

    const loadStarredFiles = async () => {
        try {
            const data = await api.getStarredFiles();
            setStarredFiles(data);
        } catch (err: any) {
            // 静默处理或使用 showToast
            console.error("加载星标文件失败", err);
        }
    };

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

    const submitNewProject = async () => {
        if (!newProjectData.name.trim()) {
            showToast('项目名称不能为空', 'warning');
            return;
        }

        try {
            await api.createProject({
                name: newProjectData.name,
                // 后端表结构中支持嵌套，若需要可在未来扩展 parent_id 参数
                // parent_id: null 
            });

            showToast('项目创建成功', 'success');
            setIsNewProjectModalOpen(false);
            setNewProjectData({ name: '', description: '' });
            loadProjects(); // 创建完毕后自动拉取最新目录树
        } catch (err: any) {
            showToast(err.message || '创建项目失败', 'error');
        }
    };

    const userMenuRef = useRef<HTMLDivElement>(null);

    // 递归渲染文件夹树的辅助函数
    const renderFolderTree = (parentId: string | null = null, depth = 0) => {
        let children = projects.filter(p => p.parent_id === parentId);
        if (parentId === null) {
            children = projects.filter(p => !p.parent_id);
        }
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
        localStorage.removeItem('token'); // 确保注销时将 jwt token 一并清除
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
                        onClick={() => navigate('/workspace')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/workspace') ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--text-sub)] hover:bg-black/5'}`}
                    >
                        <Folder className="w-4 h-4" /> 工作空间
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
                    {
                        starredFiles.length > 0 && (
                            <>
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
                            </>
                        )
                    }
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