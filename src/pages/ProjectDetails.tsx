import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, File, Star, FolderPlus } from 'lucide-react';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';
import { FileContextMenu } from '../components/FileContextMenu';

export const ProjectDetails: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { showToast, showPrompt } = useDialog();

    const [project, setProject] = useState<any | null>(null);
    const [files, setFiles] = useState<any[]>([]);

    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, file: any | null }>({ visible: false, x: 0, y: 0, file: null });

    const loadProject = async () => {
        if (!projectId) return;
        try {
            const res = await api.getProject(projectId);
            setProject(res);
        } catch (error: any) {
            showToast(error?.message || '获取工作空间失败', 'error');
        }
    }

    const loadFiles = async () => {
        if (!projectId) return;
        try {
            const res = await api.getFiles(projectId);
            setFiles(res);
        } catch (error: any) {
            showToast(error?.message || '获取文件列表失败', 'error');
        }
    };

    useEffect(() => {
        loadProject();
        loadFiles();
    }, [projectId]);

    const handleCreateFile = async () => {
        try {
            const res = await api.createFile({ name: '未命名文件', project_id: projectId, data: {} });
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
            loadFiles(); // 重新加载数据更新状态
        } catch (error: any) {
            showToast(error?.message || '星标操作失败', 'error');
        }
    };

    const handleCreateFolder = () => {
        showPrompt('新建文件夹', '', async (folderName) => {
            if (!folderName || !folderName.trim()) return;
            try {
                await api.createProject({ name: folderName.trim(), parent_id: projectId });
                showToast('文件夹创建成功', 'success');
                // 如果后续你需要在这个页面展示文件夹列表，这里可以调用加载文件夹的方法
            } catch (error: any) {
                showToast(error?.message || '创建失败', 'error');
            }
        });
    };

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans">
            <div className="flex justify-between items-end mb-8">
                <h1 className="text-3xl font-bold">{project ? project.name : '加载中...'}</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateFolder}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-main)] border border-[var(--border-line)] rounded-xl font-medium hover:bg-black/5 transition-colors shadow-sm"
                    >
                        <FolderPlus className="w-5 h-5" /> 新建文件夹
                    </button>
                    <button
                        onClick={handleCreateFile}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:bg-[var(--theme-primary-hover)] transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5" /> 新建文件
                    </button>
                </div>
            </div>

            {files.length === 0 ? (
                <div className="text-center text-[var(--text-info)] mt-20">暂无文件</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => navigate(`/file/${file.id}`)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            // 添加 group 和 relative 以支持悬浮效果和绝对定位
                            className="group relative bg-[var(--bg-panel)] rounded-3xl p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--theme-primary-shadow)] transition-all border border-[var(--border-line)] flex flex-col min-h-[220px]"
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
                            <h3 className="text-xl font-medium mt-4 pr-6">{file.name}</h3>
                            <p className="text-sm text-[var(--text-info)] mt-1">
                                更新于 {file.updated_at || '刚刚'}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* 挂载右键菜单 */}
            {contextMenu.visible && (
                <FileContextMenu
                    file={contextMenu.file}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ ...contextMenu, visible: false })}
                    onRefresh={loadFiles}
                />
            )}
        </div>
    );
};