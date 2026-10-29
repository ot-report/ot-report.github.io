// Offline cache. Bump VERSION whenever index.html changes so phones pick up the update.
// Install fetches with cache:"reload": GitHub Pages lets browsers keep files 10 min, and a stale copy would be cached as the new version.
const VERSION="ot-report-v1.18";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting())); });
// Other sites can share this address (every GitHub Pages site of one account does): touch and search only this app's own caches.
const OWN=k=>k.startsWith("ot-report-");
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>OWN(k)&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  e.respondWith(caches.open(VERSION).then(c=>c.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(res=>{ if(res&&(res.ok||res.type==="opaque")) c.put(req,res.clone()); return res; }).catch(()=>hit||c.match("./index.html"));
    return hit||net;
  })));
});
