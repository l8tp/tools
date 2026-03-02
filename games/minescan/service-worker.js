// 缓存名称
const CACHE_NAME = 'minesweeper-cache-v1.2';

// 需要缓存的资源列表
const CACHE_URLS = [
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/service-worker.js',
  '/icons/icon.png',
  '/icons/icon-512.png'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', async (event) => {
    console.log('install中', event);
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CACHE_URLS);
    await self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', async (event) => {
    console.log('activate中', event);
    const keys = await caches.keys();
    for(let key of keys){
        if (key !== CACHE_NAME){
            console.log('🗑️ 删除旧缓存:', key)
            caches.delete(key);
        }
    }
    //sw激活后，立即控制 
    await self.clients.claim();
});

//  fetch 事件 - 从缓存中获取资源
self.addEventListener('fetch', async (event) => {
    console.log('fetch中', event);
    const req = event.request.url;
    event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
    try{
        console.log('从网络读取' + req)
        const fresh = await fetch(req);
        return fresh;
    }catch(e){
        console.log('断网，从缓存读取' + req)
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        return cached;
    }
}