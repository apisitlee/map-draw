import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Inbox, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';

export const Drafts: React.FC = () => {
    const { showToast } = useDialog();
    const navigate = useNavigate();
    const [draftFiles, setDraftFiles] = useState<any[]>([]);

    useEffect(() => {
        const loadDrafts = async () => {
            try {
                const files = await api.getDraftFiles();
                setDraftFiles(files);
            } catch (error: any) {
                showToast(error?.message || '加载草稿箱失败', 'error');
            }
        };
        loadDrafts();
    }, []);

    const handleCreateFile = async () => {
        try {
            const res = await api.createFile({ name: '未命名草稿', data: {} });
            navigate(`/file/${res.id}`);
        } catch (error: any) {
            showToast(error?.message || '新建草稿失败', 'error');
        }
    };

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans select-none">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Inbox className="w-8 h-8 text-[var(--theme-primary)]" /> 草稿箱
                    </h1>
                    <p className="text-[var(--text-sub)] mt-2">这些是你还未移动到具体工作空间文件夹的文件。</p>
                </div>
                <button onClick={handleCreateFile} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:bg-[var(--theme-primary-hover)] transition-colors shadow-lg shadow-[var(--theme-primary)]/30">
                    <Plus className="w-5 h-5" /> 新建文件
                </button>
            </header>

            {draftFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20 text-[var(--text-info)]">
                    <Inbox className="w-16 h-16 mb-4 opacity-20" />
                    <p>草稿箱空空如也</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 grid-flow-row-dense">
                    {draftFiles.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => navigate(`/file/${file.id}`)}
                            className="bg-[var(--bg-panel)] rounded-lg p-6 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all border border-[var(--border-line)] flex flex-col min-h-[200px]"
                        >
                            <div className="w-12 h-12 rounded-lg bg-[var(--bg-base)]/10 flex items-center justify-center mb-auto text-[var(--theme-primary)]">
                                <File className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium mt-4">{file.name}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};