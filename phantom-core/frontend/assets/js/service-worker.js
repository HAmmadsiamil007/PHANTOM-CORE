var CACHE_NAME = 'phantom-cache-v1';
var STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/;

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
            );
        })
    );
});

function networkFirst(request) {
    return fetch(request).then(function (response) {
        if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(request, clone);
            });
        }
        return response;
    }).catch(function () {
        return caches.match(request);
    });
}

function fetchAndCache(request) {
    return fetch(request).then(function (response) {
        if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(request, clone);
            });
        }
        return response;
    });
}

function cacheFirst(request) {
    return caches.match(request).then(function (cached) {
        return cached || fetchAndCache(request);
    });
}

self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);

    if (url.origin === location.origin && STATIC_EXTENSIONS.test(url.pathname)) {
        event.respondWith(cacheFirst(event.request));
    } else {
        event.respondWith(networkFirst(event.request));
    }
});
