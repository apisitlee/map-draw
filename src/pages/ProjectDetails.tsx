import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Trash2, FolderInput, File } from 'lucide-react';
import { api } from '../services/api'; // 引入 api
import { useDialog } from '../context/DialogContext'; // 引入提示框

export const ProjectDetails: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { showToast } = useDialog();
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const handleCreateFile = async () => {
        try {
            const res = await api.createFile({ name: '未命名文件', project_id: projectId, data: {} });
            navigate(`/file/${res.id}`);
        } catch (error: any) {
            showToast(error?.message || '新建文件失败', 'error');
        }
    };

    const handleDeleteFile = (fileId: string) => {
        console.log(`删除文件: ${fileId}`);
        setActiveMenuId(null);
    };

    const handleMoveFile = (fileId: string) => {
        console.log(`弹出选择项目的弹窗，移动文件: ${fileId}`);
        setActiveMenuId(null);
    };

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans">
            <div className="flex justify-between items-end mb-8">
                <h1 className="text-3xl font-bold">{projectId}</h1>
                <button
                    onClick={handleCreateFile}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:bg-[var(--theme-primary-hover)] transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" /> 新建文件
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((fileIdx) => (
                    <div
                        key={fileIdx}
                        className="relative bg-[var(--bg-panel)] rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30 transition-all border border-[var(--border-line)]"
                    >
                        <div className="group flex justify-between items-start">
                            <div onClick={() => navigate(`/file/file_${fileIdx}`)} className="cursor-pointer flex-1">
                                <h3 className="font-medium text-lg flex items-center justify-start gap-x-1"><File className="w-4 h-4" /> file {fileIdx}</h3>
                                <p className="text-xs text-[var(--text-info)] mt-2">更新于1天前</p>
                            </div>

                            {/* 文件操作菜单 */}
                            <button onClick={() => setActiveMenuId(activeMenuId === `file_${fileIdx}` ? null : `file_${fileIdx}`)}>
                                <MoreVertical className="w-5 h-5 opacity-0 group-hover:opacity-100 text-[var(--text-info)] hover:text-[var(--text-main)]" />
                            </button>

                            {activeMenuId === `file_${fileIdx}` && (
                                <div className="absolute top-12 right-4 bg-[var(--bg-panel-hover)] border border-[var(--border-line)] rounded-lg shadow-xl z-10 w-32 py-1">
                                    <button
                                        onClick={() => handleMoveFile(`file_${fileIdx}`)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-main hover:bg-[var(--bg-base)]"
                                    >
                                        <FolderInput className="w-4 h-4" /> 移动至
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFile(`file_${fileIdx}`)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--bg-base)]"
                                    >
                                        <Trash2 className="w-4 h-4" /> 删除
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};