// Cache names
const dynamicCacheName = 'DYNAMIC_V3';
const preCacheName = 'PRE_V4';
// Cache assets
const preCacheAssets = [
							'/offline.html',
							'/js/peer.js',
							'https://webrtc.github.io/adapter/adapter-latest.js'
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
				.filter(key => (key !== dynamicCacheName) && (key !== preCacheName))
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
	if (evt.request.url.indexOf('google.firestore.v1.Firestore') == -1){
		caches.match(evt.request).then(cacheRes => {
			return cacheRes || fetch(evt.request).then(fetchRes => {
				return caches.open(dynamicCacheName).then(cache => {
				  cache.put(evt.request.url, fetchRes.clone());
				  // check cached items size
				  limitCacheSize(dynamicCacheName, 20);
				  return fetchRes;
				});
			});
		});
	};
});