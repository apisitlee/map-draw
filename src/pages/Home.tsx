import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid, List as ListIcon, Search, ChevronDown, File, Star } from 'lucide-react';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';
import { FileContextMenu } from '../components/FileContextMenu';

// 定义排序和视图的类型
type SortMode = 'recentOpen' | 'recentCreate' | 'fileName';
type SortOrder = 'desc' | 'asc';
type ViewMode = 'grid' | 'list';

export const Home: React.FC = () => {
    const { showToast } = useDialog();
    const navigate = useNavigate();

    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, file: any | null }>({ visible: false, x: 0, y: 0, file: null });

    // --- 状态管理 ---
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortMode, setSortMode] = useState<SortMode>('recentOpen');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // 项目筛选多选下拉框状态
    const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
    const [projectSearchText, setProjectSearchText] = useState('');
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const projectMenuRef = useRef<HTMLDivElement>(null);

    // 存储后端返回的真实数据
    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const fetchedProjects = await api.getProjects();
            const fetchedFiles = await api.getFiles();
            setAllProjects(fetchedProjects);
            setFiles(fetchedFiles);
        } catch (error: any) {
            console.error("获取数据失败:", error);
            showToast(error?.message || '获取项目列表失败', 'error');
        }
    };
    // 组件加载时获取数据
    useEffect(() => {
        loadData();
    }, []);

    // 处理下拉框点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
                setIsProjectFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 智能切换排序逻辑
    const handleSortModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value as SortMode;
        setSortMode(newMode);
        // 根据选择的排序方式赋予默认的顺序
        if (newMode === 'fileName') {
            setSortOrder('asc'); // 默认 A-Z
        } else {
            setSortOrder('desc'); // 默认 时间从近到远
        }
    };

    const toggleProjectSelection = (proj: string) => {
        setSelectedProjects(prev =>
            prev.includes(proj) ? prev.filter(p => p !== proj) : [...prev, proj]
        );
    };

    const handleCreateFile = async () => {
        try {
            // 最近打开页面新建的文件，没有归属文件夹，相当于进入草稿箱
            const res = await api.createFile({ name: '未命名文件', data: {} });
            navigate(`/file/${res.id}`);
        } catch (error: any) {
            showToast(error?.message || '新建文件失败', 'error');
        }
    };

    const handleContextMenu = (e: React.MouseEvent, file: any) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, file });
    };

    const handleToggleStar = async (e: React.MouseEvent, file: any) => {
        e.stopPropagation(); // 阻止冒泡，防止触发卡片点击进入地图页面
        try {
            await api.starFile(file.id);
            loadData(); // 重新加载数据更新状态
        } catch (error: any) {
            showToast(error?.message || '星标操作失败', 'error');
        }
    };

    const filteredProjects = allProjects.filter(p => p.name.toLowerCase().includes(projectSearchText.toLowerCase()));

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans select-none">

            {/* 1. 顶部：页面标题 + 新建文件按钮 */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">所有文件</h1>
                    <p className="text-[var(--text-sub)] mt-2">管理你的所有地图和设计资源。</p>
                </div>
                <button onClick={handleCreateFile} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:bg-[var(--theme-primary-hover)] transition-colors shadow-lg shadow-[var(--theme-primary)]/30 disabled:opacity-50">
                    <Plus className="w-5 h-5" /> 新建文件
                </button>
            </header>

            {/* 2. 操作栏：筛选条件和视图切换 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-1 rounded-2xl">

                {/* 筛选条件 */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* 排序方式选择 */}
                    <div className="flex items-center gap-2 bg-[var(--bg-panel)] px-3 py-1.5 rounded-lg border border-[var(--border-line)]">
                        <span className="text-xs text-[var(--text-sub)]">排序:</span>
                        <select
                            value={sortMode}
                            onChange={handleSortModeChange}
                            className="bg-transparent text-sm text-[var(--text-main)] outline-none cursor-pointer"
                        >
                            <optgroup label="排序方法">
                                <option value="recentOpen" className="bg-[var(--bg-panel)]">最近打开</option>
                                <option value="recentCreate" className="bg-[var(--bg-panel)]">最近创建</option>
                                <option value="fileName" className="bg-[var(--bg-panel)]">文件名称</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* 排序顺序选择 */}
                    {sortMode !== 'recentOpen' && (
                        <div className="flex items-center gap-2 bg-[var(--bg-panel)] px-3 py-1.5 rounded-lg border border-[var(--border-line)]">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                className="bg-transparent text-sm text-[var(--text-main)] outline-none cursor-pointer"
                            >
                                {sortMode === 'recentCreate' ? (
                                    <>
                                        <option value="desc" className="bg-[var(--bg-panel)]">从近到远</option>
                                        <option value="asc" className="bg-[var(--bg-panel)]">从远到近</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="asc" className="bg-[var(--bg-panel)]">升序 A-Z</option>
                                        <option value="desc" className="bg-[var(--bg-panel)]">降序 Z-A</option>
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    {/* 选择项目 (添加了复选框) */}
                    <div className="relative" ref={projectMenuRef}>
                        <button
                            onClick={() => setIsProjectFilterOpen(!isProjectFilterOpen)}
                            className="flex items-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-line)] transition-colors"
                        >
                            <span className="text-sm">项目 {selectedProjects.length > 0 ? `(${selectedProjects.length})` : ''}</span>
                            <ChevronDown className="w-4 h-4 text-[var(--text-sub)]" />
                        </button>

                        {isProjectFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-xl shadow-2xl p-2 z-30">
                                <div className="flex items-center bg-[var(--bg-base)] rounded-lg px-2 py-1.5 mb-2">
                                    <Search className="w-4 h-4 text-[var(--text-sub)] mr-2" />
                                    <input
                                        type="text" placeholder="搜索项目..." value={projectSearchText}
                                        onChange={(e) => setProjectSearchText(e.target.value)}
                                        className="bg-transparent text-sm text-[var(--text-main)] w-full outline-none"
                                    />
                                </div>
                                <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                                    {filteredProjects.map(proj => (
                                        <label key={proj} className="flex items-center gap-3 w-full px-2 py-2 text-sm text-left hover:bg-[var(--bg-panel-hover)] rounded-md cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedProjects.includes(proj)}
                                                onChange={() => toggleProjectSelection(proj)}
                                                className="w-4 h-4 accent-[var(--theme-primary)] rounded cursor-pointer"
                                            />
                                            <span className="truncate">{proj}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 视图切换按钮保持原样，替换颜色变量 */}
                <div className="flex items-center bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-line)]">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--text-sub)]'}`}>
                        <Grid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--text-sub)]'}`}>
                        <ListIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid 风格的文件列表 */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 grid-flow-row-dense">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => navigate(`/file/${file.id}`)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className="group relative bg-[var(--bg-panel)] rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:shadow-[var(--theme-primary-shadow)] transition-all border border-[var(--border-line)] flex flex-col min-h-[220px]"
                        >
                            {/* 右上角星标按钮 */}
                            <button
                                onClick={(e) => handleToggleStar(e, file)}
                                className={`absolute top-5 right-5 p-1.5 rounded-lg transition-all duration-200 ${file.is_starred
                                    ? 'opacity-100 text-yellow-400'
                                    : 'opacity-0 group-hover:opacity-100 text-[var(--text-sub)] hover:bg-black/5 hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Star className={`w-5 h-5 ${file.is_starred ? 'fill-yellow-400' : ''}`} />
                            </button>
                            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)]/20 flex items-center justify-center mb-auto text-[var(--theme-primary)]">
                                <File className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mt-4">{file.name}</h3>
                            <p className="text-sm text-[var(--text-info)] mt-1">
                                更新于 {file.updated_at || '刚刚'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {files.map(file => (
                        <div
                            key={file.id}
                            onClick={() => navigate(`/file/${file.id}`)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className="flex items-center justify-between bg-[var(--bg-panel)] rounded-xl p-4 cursor-pointer transition-colors border border-[var(--border-line)]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)]">
                                    <File className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{file.name}</h3>
                                    <p className="text-xs text-[var(--text-sub)]">{file.project}</p>
                                </div>
                            </div>
                            <span className="text-sm text-[var(--text-sub)]">{file.date}</span>
                        </div>
                    ))}
                </div>
            )}

            {contextMenu.visible && (
                <FileContextMenu
                    file={contextMenu.file}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ ...contextMenu, visible: false })}
                    onRefresh={loadData}
                />
            )}
        </div>
    );
};