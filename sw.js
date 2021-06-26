// Cache names
const staticCacheName = 'STATIC_V1';
const dynamicCacheName = 'DYNAMIC_V1';
const preCacheName = 'PRE_V1';
// Cache assets
const preCacheAssets = ['/offline.html'];
const staticAssets = [
	'/',
	'/index.html',
	'/js/app.js',
	'/css/styles.css',
	'/js/peer.js',
	'https://webrtc.github.io/adapter/adapter-latest.js',
	'https://www.gstatic.com/firebasejs/8.6.8/firebase-firestore.js',
	'https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js',
	'https://i.creativecommons.org/l/by-nc-nd/4.0/80x15.png'
];

// cache size limit function
const limitCacheSize = (name, size) => {
	caches.open(name).then(cache => {
		cache.keys().then(keys => {
			if(keys.length > size){
				cache.delete(keys[0]).then(limitCacheSize(name, size));
			}
		});
	});
};

// install event
self.addEventListener('install', evt => {
	//console.log('service worker installed');
	self.skipWaiting();
	evt.waitUntil(
		caches.open(preCacheName).then((cache) => {
		console.log('Pre-caching...');
		cache.addAll(preCacheAssets);
		})
	);
});

// activate event
self.addEventListener('activate', evt => {
	//console.log('service worker activated');
	evt.waitUntil(
		// Delete old caches versions
		caches.keys().then(keys => {
			return Promise.all(keys
				.filter(key => (key !== staticCacheName) && (key !== dynamicCacheName) && (key !== preCacheName))
				.map(key => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

// fetch events
self.addEventListener('fetch', evt => {
	//console.log(evt)
	if (evt.request.mode === "navigate") {
	evt.respondWith(
		(async () => {
			try {
				// First, try to use the navigation preload response if it's supported.
				const preloadResponse = await evt.preloadResponse;
				if (preloadResponse) {
					return preloadResponse;
				}
				// Always try the network first.
				const networkResponse = await fetch(evt.request);
				return networkResponse;
			} catch (error) {
				console.log("Fetch failed; returning offline page instead.", error);
				const cache = await caches.open(preCacheName);
				const cachedResponse = await cache.match('/offline.html');
				return cachedResponse;
			}
		})()
	);
	};
});