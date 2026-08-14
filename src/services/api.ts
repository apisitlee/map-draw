// src/services/api.ts

const API_BASE_URL = '/api';

// 基础请求封装，自动处理 Token 和 JSON 解析
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token 过期或无效，清除本地状态并跳转登录
                localStorage.removeItem('token');
                localStorage.removeItem('isAuthenticated');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `请求失败 (${response.status})`);
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `请求失败 (${response.status})`);
        }

        return response.json();
    } catch (error: any) {
        // 可以在这里或者调用层统一处理错误抛出
        throw error;
    }
}

// 接口调用函数
export const api = {
    login: (data: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    // --- 项目(工作空间)相关 ---
    createProject: (data: any) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(data) }),
    updateProject: (id: string | number, data: any) => fetchWithAuth(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProject: (id: string | number) => fetchWithAuth(`/projects/${id}`, { method: 'DELETE' }),
    getProjects: () => fetchWithAuth('/projects'),
    getProject: (id: string | number) => fetchWithAuth(`/projects/${id}`),

    // --- 文件相关 ---
    createFile: (data: any) => fetchWithAuth('/files', { method: 'POST', body: JSON.stringify(data) }),
    deleteFile: (id: string | number) => fetchWithAuth(`/files/${id}`, { method: 'DELETE' }),
    updateFile: (id: string | number, data: any) => fetchWithAuth(`/files/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getFiles: (projectId?: string) => fetchWithAuth(`/files${projectId ? `?project_id=${projectId}` : ''}`),
    getFile: (id: string | number) => fetchWithAuth(`/files/${id}`),
    getDraftFiles: () => fetchWithAuth('/files/drafts'),
    starFile: (id: string | number) => fetchWithAuth(`/files/${id}/star`, { method: 'PUT' }),
    moveFile: (fileId: string | number, projectId: string | number) => fetchWithAuth(`/files/${fileId}/move`, { method: 'PUT', body: JSON.stringify({ project_id: projectId }) }),

    // --- 回收站与星标文件 ---
    getTrashFiles: () => fetchWithAuth('/files/trash'),
    getStarredFiles: () => fetchWithAuth('/files/starred'),
    restoreFile: (id: string | number) => fetchWithAuth(`/files/${id}/restore`, { method: 'POST' }),
    hardDeleteFile: (id: string | number) => fetchWithAuth(`/files/${id}/hard_delete`, { method: 'DELETE' }),
    emptyTrash: () => fetchWithAuth('/files/trash/empty', { method: 'DELETE' }),
};