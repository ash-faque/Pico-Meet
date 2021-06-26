const staticCacheName = 'site-static-v0';
const dynamicCacheName = 'site-dynamic-v0';
const preCacheName = 'prechache-v1';
const preCacheAssets = ['/404.html'];
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
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => (key !== staticCacheName) && (key !== dynamicCacheName) && (key !== preCacheName))
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  //console.log(evt)
    evt.respondWith(
      fetch(evt.request)
        .then(fetchRes => { return fetchRes; })
        .catch(() => {
          if(evt.request.url.indexOf('.html') > -1){
            return caches.match('/404.html');
          } 
        })
    );
});

// commented as no full fledge offlinemode
/* evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 7);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('/404.html');
        } 
      })
    ); */