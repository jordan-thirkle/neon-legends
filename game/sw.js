const CACHE='neon-legends-v1'
const PRECACHE=['/','/index.html','/style.css','/game.js']
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRECACHE)}))
  self.skipWaiting()
})
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k) }))
    }).then(function(){ return self.clients.claim() })
  )
})
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(function(r){return r || fetch(e.request)}))
})