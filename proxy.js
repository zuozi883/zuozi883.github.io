// Pi Network 数据代理 (GitHub Pages主站版本)
// 部署在：https://zuozi883.github.io/proxy.js
const PI_API_BASE = 'https://api.mainnet.minepi.com';

// 主处理函数
async function handlePiRequest(params) {
    // 从URL参数中获取 endpoint，例如 ?endpoint=/network/stats
    const urlParams = new URLSearchParams(window.location.search);
    const endpoint = urlParams.get('endpoint') || '/network/stats';
    
    // 简单的端点验证
    const allowedEndpoints = ['/network/stats', '/blocks'];
    if (!allowedEndpoints.some(e => endpoint.startsWith(e))) {
        return JSON.stringify({
            error: '端点不被允许',
            allowed: allowedEndpoints
        });
    }
    
    try {
        // 构建完整URL
        let url = `${PI_API_BASE}${endpoint}`;
        
        // 传递其他查询参数（如 limit, order）
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.delete('endpoint'); // 移除已用的参数
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        
        console.log(`正在请求: ${url}`);
        
        // 发送请求到Pi Network API
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'GitHub-Pi-Proxy/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Pi API 错误: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 返回JSON数据（设置CORS头部）
        return JSON.stringify({
            success: true,
            data: data,
            proxy: 'github-pages',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('代理错误:', error);
        return JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// 使函数全局可用
window.handlePiRequest = handlePiRequest;

// 如果直接访问此文件，自动执行（用于测试）
if (window.location.pathname.endsWith('proxy.js') && window.location.search) {
    handlePiRequest().then(result => {
        // 设置响应头并返回数据
        const blob = new Blob([result], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.location.href = url;
    });
}
