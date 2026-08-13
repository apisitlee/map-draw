import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid, List as ListIcon, Search, ChevronDown, Check, File } from 'lucide-react';

// 定义排序和视图的类型
type SortMode = 'recentOpen' | 'recentCreate' | 'fileName';
type SortOrder = 'desc' | 'asc';
type ViewMode = 'grid' | 'list';

export const Home: React.FC = () => {
    const navigate = useNavigate();

    // --- 状态管理 ---
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortMode, setSortMode] = useState<SortMode>('recentOpen');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // 项目筛选多选下拉框状态
    const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
    const [projectSearchText, setProjectSearchText] = useState('');
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const projectMenuRef = useRef<HTMLDivElement>(null);

    // 模拟的项目列表和文件列表数据
    const allProjects = ['Project Alpha', 'Project Beta', 'Design System', 'File Assets'];
    const mockFiles = [
        { id: 'map_001', name: '示例地图 1', date: '2026-08-12', project: 'Project Alpha' },
        { id: 'map_002', name: '示例地图 2', date: '2026-08-10', project: 'Project Beta' },
        { id: 'map_003', name: '城市规划图', date: '2026-08-01', project: 'Project Alpha' },
    ];

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

    const filteredProjects = allProjects.filter(p => p.toLowerCase().includes(projectSearchText.toLowerCase()));

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans select-none">

            {/* 1. 顶部：页面标题 + 新建文件按钮 */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">所有文件</h1>
                    <p className="text-[var(--text-sub)] mt-2">管理你的所有地图和设计资源。</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:bg-[var(--theme-primary-hover)] transition-colors shadow-lg shadow-[var(--theme-primary)]/30 disabled:opacity-50">
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
                        <div className="flex items-center gap-2 bg-[#3b0764] px-3 py-1.5 rounded-lg border ">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                className="bg-transparent text-sm text-white outline-none cursor-pointer"
                            >
                                {sortMode === 'recentCreate' ? (
                                    <>
                                        <option value="desc" className="bg-[#2e1065]">从近到远</option>
                                        <option value="asc" className="bg-[#2e1065]">从远到近</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="asc" className="bg-[#2e1065]">升序 A-Z</option>
                                        <option value="desc" className="bg-[#2e1065]">降序 Z-A</option>
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

            {/* Bento Grid 风格的文件列表 */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 grid-flow-row-dense">
                    {mockFiles.map((file, idx) => (
                        <div
                            key={file.id}
                            onClick={() => navigate(`/file/${file.id}`)}
                            className={`bg-[var(--bg-panel)] rounded-3xl p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--theme-primary-shadow)] transition-all border border-[var(--border-line)] flex flex-col min-h-[220px]`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)]/20 flex items-center justify-center mb-auto text-[var(--theme-primary)]">
                                <File className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mt-4">{file.name}</h3>
                            <p className="text-sm text-[var(--text-sub)] mt-1">{file.project}</p>
                            <p className="text-xs text-[var(--text-sub)] opacity-70 mt-4">{file.date}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {mockFiles.map(file => (
                        <div
                            key={file.id}
                            onClick={() => navigate(`/file/${file.id}`)}
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
        </div>
    );
};