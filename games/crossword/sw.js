const CACHE_NAME = 'bricks_v1.1';
const CACHE_URLS = [
    'index.html',
    'sw.js',
    'manifest.json',
    'images/touch/icon-192.png',
    'images/touch/icon-512.png'
];

self.addEventListener('install', async event => {
    console.log('install中', event);
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CACHE_URLS);
    await self.skipWaiting();
});
self.addEventListener('activate', async event => {
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

self.addEventListener('fetch', event => {
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