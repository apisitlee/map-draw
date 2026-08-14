import React, { useState, useEffect } from 'react';
import { Trash2, File, Copy, RotateCcw, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';

export const Trash: React.FC = () => {
    const { showToast, showConfirm } = useDialog();
    const [trashFiles, setTrashFiles] = useState<any[]>([]);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, file: any | null }>({ visible: false, x: 0, y: 0, file: null });

    const loadTrash = async () => {
        try {
            const files = await api.getTrashFiles();
            setTrashFiles(files);
        } catch (error: any) {
            showToast(error?.message || '加载回收站失败', 'error');
        }
    };

    useEffect(() => {
        loadTrash();

        // 点击页面其他地方关闭右键菜单
        const handleClickOutside = () => setContextMenu(prev => ({ ...prev, visible: false }));
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, file: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, file });
    };

    // --- 右键菜单操作 ---
    const handleDuplicateToDrafts = async () => {
        try {
            const originalFile = await api.getFile(contextMenu.file.id);
            await api.createFile({
                name: `${contextMenu.file.name} (副本)`,
                project_id: null, // null 表示放到草稿箱
                data: originalFile.data
            });
            showToast('已创建副本到草稿箱', 'success');
            setContextMenu(prev => ({ ...prev, visible: false }));
        } catch (error: any) {
            showToast(error?.message || '操作失败', 'error');
        }
    };

    const handleRestore = async () => {
        try {
            await api.restoreFile(contextMenu.file.id);
            showToast('文件已放回原处', 'success');
            loadTrash();
            setContextMenu(prev => ({ ...prev, visible: false }));
        } catch (error: any) {
            showToast(error?.message || '恢复失败', 'error');
        }
    };

    const handleHardDelete = () => {
        showConfirm(`彻底删除 "${contextMenu.file.name}" 后将无法恢复，确定吗？`, async () => {
            try {
                await api.hardDeleteFile(contextMenu.file.id);
                showToast('文件已彻底删除', 'success');
                loadTrash();
            } catch (error: any) {
                showToast(error?.message || '删除失败', 'error');
            }
        });
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleEmptyTrash = () => {
        if (trashFiles.length === 0) return;
        showConfirm('确定要清空回收站吗？此操作不可恢复！', async () => {
            try {
                await api.emptyTrash();
                showToast('回收站已清空', 'success');
                loadTrash();
            } catch (error: any) {
                showToast(error?.message || '清空失败', 'error');
            }
        });
    };

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans select-none">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Trash2 className="w-8 h-8 text-red-500" /> 回收站
                    </h1>
                    <p className="text-[var(--text-sub)] mt-2">在这里管理已删除的文件</p>
                </div>
                <button
                    onClick={handleEmptyTrash}
                    disabled={trashFiles.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" /> 清空回收站
                </button>
            </header>

            {trashFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20 text-[var(--text-info)]">
                    <Trash2 className="w-16 h-16 mb-4 opacity-20" />
                    <p>回收站是空的</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 grid-flow-row-dense">
                    {trashFiles.map((file) => (
                        <div
                            key={file.id}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className="bg-[var(--bg-panel)] rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all border border-[var(--border-line)] flex flex-col min-h-[160px] opacity-70 cursor-context-menu"
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-auto text-red-500">
                                <File className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-medium mt-4 text-[var(--text-sub)]">{file.name}</h3>
                            <p className="text-sm text-[var(--text-sub)] mt-1">更新于 {file.updated_at || '未知'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* 自定义右键菜单 */}
            {contextMenu.visible && (
                <div
                    className="fixed z-[9999] bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-xl shadow-2xl py-1.5 min-w-[180px] flex flex-col"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <button onClick={handleDuplicateToDrafts} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-base)] transition-colors">
                        <Copy className="w-4 h-4" /> <span>创建副本到草稿箱</span>
                    </button>
                    <button onClick={handleRestore} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-base)] transition-colors">
                        <RotateCcw className="w-4 h-4" /> <span>放回原处</span>
                    </button>
                    <div className="h-[1px] bg-[var(--border-line)] my-1 mx-2" />
                    <button onClick={handleHardDelete} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <XCircle className="w-4 h-4" /> <span>彻底删除</span>
                    </button>
                </div>
            )}
        </div>
    );
};