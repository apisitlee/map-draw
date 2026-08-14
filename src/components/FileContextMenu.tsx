import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MousePointerClick, ExternalLink, Copy, Edit2, Trash2, Star, FolderInput } from 'lucide-react';
import { api } from '../services/api';
import { useDialog } from '../context/DialogContext';

interface FileContextMenuProps {
    file: any;
    x: number;
    y: number;
    onClose: () => void;
    onRefresh: () => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({ file, x, y, onClose, onRefresh }) => {
    const navigate = useNavigate();
    const { showToast, showPrompt, showConfirm } = useDialog();

    useEffect(() => {
        const handleClickOutside = () => onClose();
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    if (!file) return null;

    // 1. 打开
    const handleOpen = () => {
        navigate(`/file/${file.id}`);
    };

    // 2. 在新标签页中打开
    const handleOpenNewTab = () => {
        window.open(`/file/${file.id}`, '_blank');
    };

    // 3. 创建副本
    const handleDuplicate = async () => {
        try {
            const originalFile = await api.getFile(file.id);
            await api.createFile({
                name: `${file.name} (副本)`,
                project_id: originalFile.project_id,
                data: originalFile.data
            });
            showToast('副本创建成功', 'success');
            onRefresh();
        } catch (error: any) {
            showToast(error?.message || '创建副本失败', 'error');
        }
    };

    // 4. 重命名
    const handleRename = () => {
        showPrompt('重命名文件', file.name, async (newName) => {
            if (!newName || newName.trim() === '') return;
            try {
                await api.updateFile(file.id, { name: newName.trim() });
                showToast('重命名成功', 'success');
                onRefresh();
            } catch (error: any) {
                showToast(error?.message || '重命名失败', 'error');
            }
        });
    };

    // 5. 标星
    const handleStar = async () => {
        try {
            await api.starFile(file.id);
            showToast('已更新标星状态', 'success');
            onRefresh();
        } catch (error: any) {
            showToast(error?.message || '操作失败', 'error');
        }
    };

    // 6. 移动文件
    const handleMove = () => {
        showPrompt('请输入目标工作空间(Project)的ID', '', async (projectIdStr) => {
            if (!projectIdStr || projectIdStr.trim() === '') return;
            try {
                await api.moveFile(file.id, parseInt(projectIdStr.trim(), 10));
                showToast('移动成功', 'success');
                onRefresh();
            } catch (error: any) {
                showToast(error?.message || '移动失败', 'error');
            }
        });
    };

    // 7. 删除
    const handleDelete = () => {
        showConfirm(`确定要将 "${file.name}" 移入回收站吗？`, async () => {
            try {
                await api.deleteFile(file.id);
                showToast('文件已移入回收站', 'success');
                onRefresh();
            } catch (error: any) {
                showToast(error?.message || '删除失败', 'error');
            }
        });
    };

    // 确保菜单不超出屏幕边界
    const menuWidth = 200;
    const menuHeight = 300;
    const styleLeft = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
    const styleTop = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;

    return (
        <div
            className="fixed z-[9999] bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-xl shadow-2xl py-1.5 min-w-[180px] flex flex-col"
            style={{ top: `${styleTop}px`, left: `${styleLeft}px` }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <MenuItem icon={<MousePointerClick className="w-4 h-4" />} label="打开" onClick={() => { handleOpen(); onClose() }} />
            <MenuItem icon={<ExternalLink className="w-4 h-4" />} label="在新标签页中打开" onClick={() => { handleOpenNewTab(); onClose() }} />
            <div className="h-[1px] bg-[var(--border-line)] my-1 mx-2" />
            <MenuItem icon={<Copy className="w-4 h-4" />} label="创建副本" onClick={() => { handleDuplicate(); onClose() }} />
            <MenuItem icon={<Edit2 className="w-4 h-4" />} label="重命名" onClick={() => { handleRename(); onClose() }} />
            <MenuItem icon={<Star className={`w-4 h-4 ${file.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />} label={file.is_starred ? "取消标星" : "标星"} onClick={() => { handleStar(); onClose() }} />
            <MenuItem icon={<FolderInput className="w-4 h-4" />} label="移动文件" onClick={() => { handleMove(); onClose() }} />
            <div className="h-[1px] bg-[var(--border-line)] my-1 mx-2" />
            <MenuItem icon={<Trash2 className="w-4 h-4 text-red-500" />} label="删除" onClick={() => { handleDelete(); onClose() }} isDanger />
        </div>
    );
};

// 辅助菜单项组件
const MenuItem = ({ icon, label, onClick, isDanger = false }: any) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDanger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-[var(--text-main)] hover:bg-[var(--bg-base)]'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
};