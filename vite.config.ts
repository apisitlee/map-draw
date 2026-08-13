import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          // 可选：如果后端不需要 /api 前缀，可以通过 rewrite 去掉；
          // 但根据我们之前的 Flask 路由设计（@app.route('/api/auth/login')），我们需要保留 /api 前缀，因此这里保持原样或使用函数确保正确转发：
          rewrite: (path) => path,
          // 添加代理事件监听，方便你在前端终端（运行 npm run dev 的窗口）查看代理是否成功转发
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('代理发生错误:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('正在发送代理请求:', req.method, req.url, '-> 目标:', options.target + proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('收到代理响应:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  };
});
