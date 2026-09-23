const CACHE="prepa-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function keep(req,res){if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;}
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const u=new URL(req.url);
  if(u.origin===self.location.origin){
    if(req.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith(".html")){e.respondWith(fetch(req).then(r=>keep(req,r)).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html"))));return;}
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(r2=>keep(req,r2))));return;
  }
  if(u.hostname==="cdn.jsdelivr.net"){e.respondWith(caches.match(req).then(r=>r||fetch(req).then(r2=>keep(req,r2))));}
});
