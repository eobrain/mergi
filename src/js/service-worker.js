/* global self, caches, fetch */

const cacheName = 'kartoj-v2'

const style = ['app', 'common', 'debug', 'deck', 'index', 'info', 'normalize']
const countries = ['es', 'fr', 'ie', 'mx', 'us']
const locales = ['es_es', 'fr_fr', 'en_ie', 'es_mx', 'en_us']
const precacheResources = [
  'index.html',
  'images/noun_Man_1912182_32x32.png',
  ...countries.map(country => `images/flag_${country}.jpg`),
  ...style.map(s => `css/${s}.css`),
  ...locales.map(locale => `card_${locale}.html`)
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
