import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';

export const Workspaces: React.FC = () => {
    const navigate = useNavigate();
    const { showToast, showPrompt } = useDialog();
    const [projects, setProjects] = useState<any[]>([]);

    const loadProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data.filter((p: any) => !p.parent_id)); // 只展示根工作空间
        } catch (error: any) {
            showToast(error?.message || '加载失败', 'error');
        }
    };

    useEffect(() => { loadProjects(); }, []);

    const handleCreateProject = () => {
        showPrompt('新建工作空间', '', async (name) => {
            if (!name || !name.trim()) return;
            try {
                await api.createProject({ name: name.trim() });
                showToast('创建成功', 'success');
                loadProjects();
            } catch (error: any) {
                showToast(error?.message || '创建失败', 'error');
            }
        });
    };

    return (
        <div className="min-h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 md:p-12 font-sans select-none">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Folder className="w-8 h-8 text-[var(--theme-primary)]" /> 工作空间
                    </h1>
                    <p className="text-[var(--text-sub)] mt-2">管理你的所有项目与分类</p>
                </div>
                <button onClick={handleCreateProject} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:bg-[var(--theme-primary-hover)] transition-colors shadow-lg">
                    <Plus className="w-5 h-5" /> 新建工作空间
                </button>
            </header>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20 text-[var(--text-info)]">
                    <Folder className="w-16 h-16 mb-4 opacity-20" />
                    <p>暂无工作空间</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {projects.map(proj => (
                        <div
                            key={proj.id}
                            onClick={() => navigate(`/project/${proj.id}`)}
                            className="bg-[var(--bg-panel)] rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:shadow-[var(--theme-primary-shadow)] transition-all border border-[var(--border-line)] flex flex-col gap-4 min-h-[160px]"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)]">
                                <Folder className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium">{proj.name}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};