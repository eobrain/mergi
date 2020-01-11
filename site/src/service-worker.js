/* global self, caches, fetch */

const cacheName = 'cache-v1'
const precacheResources = [
  'index.html',
  'images/flag_es.webp',
  'images/flag_fr.webp',
  'images/flag_ie.webp',
  'images/flag_mx.webp',
  'images/flag_us.webp',
  'css/normalize.css',
  'css/app.css',
  'css/index.css',
  'images/noun_Man_1912182_32x32.png',
  'card_es_es.html',
  'card_es_mx.html',
  'card_fr_fr.html',
  'card_en_ie.html',
  'card_en_us.html'
]

self.addEventListener('install', event => {
  console.log('Service worker install event!')
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(precacheResources))
  )
})

self.addEventListener('activate', event => {
  console.log('Service worker activate event!')
})

self.addEventListener('fetch', event => {
  console.log(`Fetch intercepted for "${event.request.url}"`)
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => cachedResponse || fetch(event.request))
  )
})
