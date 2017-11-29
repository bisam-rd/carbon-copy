const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

const PRECACHE_URLS = [
    'https://cdn.jsdelivr.net/npm/xtal-decorator/build/ES6/xtal-decorator.js',
    'https://cdn.jsdelivr.net/npm/xtal-json-editor/build/ES6/xtal-json-editor.js'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event['waitUntil'](
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self['skipWaiting']())
    );
});

//The fetch handler serves responses for same-origin resources from a cache.
//If no response is found, it populates the runtime cache with the response
//from the network before returning it to the page.
self.addEventListener('fetch', event => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event['request'].url.startsWith(self.location.origin) || event['request'].url.startsWith('https://cdn.jsdelivr.net')) {
      event['respondWith'](
        caches.match(event['request']).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          //return caches.open(RUNTIME).then(cache => {
            return fetch(event['request']).then(response => {
              // Put a copy of the response in the runtime cache.
              //return cache.put(event.request, response.clone()).then(() => {
                return response;
              //});
            });
          //});
        })
      );
    }
  });