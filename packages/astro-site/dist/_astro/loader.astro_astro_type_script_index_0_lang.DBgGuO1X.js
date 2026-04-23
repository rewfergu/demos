import{E as M}from"./exif-reader.3fswl013.js";import{m as g}from"./maplibre-gl.BnDmFfQ4.js";import"./_commonjsHelpers.Cpj98o6Y.js";async function P(o){try{const e=await o.arrayBuffer(),t=M.load(e,{expanded:!0});return t.gps&&t.gps.Latitude!=null&&t.gps.Longitude!=null?{lat:t.gps.Latitude,lng:t.gps.Longitude}:null}catch{return null}}const D="photo-location-db",S=1,f="entries";function k(){return new Promise((o,e)=>{const t=indexedDB.open(D,S);t.onupgradeneeded=n=>{const a=n.target.result;a.objectStoreNames.contains(f)||a.createObjectStore(f,{keyPath:"id",autoIncrement:!0})},t.onsuccess=()=>o(t.result),t.onerror=()=>e(t.error)})}async function F(o){const e=await k();return new Promise((t,n)=>{const a=e.transaction(f,"readwrite"),s=a.objectStore(f).add({...o,createdAt:Date.now()});s.onsuccess=()=>t(s.result),s.onerror=()=>n(s.error),a.oncomplete=()=>e.close()})}async function N(){const o=await k();return new Promise((e,t)=>{const n=o.transaction(f,"readonly"),r=n.objectStore(f).getAll();r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error),n.oncomplete=()=>o.close()})}const z={version:8,glyphs:"https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",sources:{"osm-tiles":{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"&copy; OpenStreetMap contributors"}},layers:[{id:"osm-tiles-layer",type:"raster",source:"osm-tiles",minzoom:0,maxzoom:19}]};function R(o){const e=new g.Map({container:o,style:z,center:[0,20],zoom:2});return e.addControl(new g.NavigationControl,"top-right"),e}function I(o,e){const t=`
    <div class="marker-popup">
      <img src="${e.photoDataUrl}" alt="${e.name}" />
      <h3>${e.name}</h3>
      <p>${e.description}</p>
    </div>
  `,n=new g.Popup({offset:25,maxWidth:"280px"}).setHTML(t);new g.Marker({color:"#e74c3c"}).setLngLat([e.lng,e.lat]).setPopup(n).addTo(o)}function j(o,e){const t=new g.Marker({color:"#3b82f6",draggable:!0});t.on("dragend",()=>{const{lng:a,lat:r}=t.getLngLat();e(a,r)});let n=!1;return{set(a,r){t.setLngLat([a,r]),n||(t.addTo(o),n=!0)},clear(){n&&(t.remove(),n=!1)}}}function T(o,e){if(e.length!==0)if(e.forEach(t=>I(o,t)),e.length===1)o.flyTo({center:[e[0].lng,e[0].lat],zoom:12});else{const t=new g.LngLatBounds;e.forEach(n=>t.extend([n.lng,n.lat])),o.fitBounds(t,{padding:60})}}const x=`
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
`;function U(o,e=800){return new Promise(t=>{const n=new Image,a=URL.createObjectURL(o);n.onload=()=>{URL.revokeObjectURL(a);let{width:r,height:s}=n;(r>e||s>e)&&(r>s?(s=Math.round(s*e/r),r=e):(r=Math.round(r*e/s),s=e));const d=document.createElement("canvas");d.width=r,d.height=s,d.getContext("2d").drawImage(n,0,0,r,s),t(d.toDataURL("image/jpeg",.7))},n.src=a})}function C(o){o.innerHTML=`
    <div class="pl-layout">
      <div class="pl-sidebar">
        <form class="pl-form" id="pl-form">
          <div class="pl-field">
            <label for="pl-photo">Photo</label>
            <input type="file" id="pl-photo" accept="image/*" capture="environment" required />
            <div id="pl-preview" class="pl-preview" hidden>
              <img id="pl-preview-img" alt="Preview" />
            </div>
          </div>
          <div class="pl-field pl-row">
            <div>
              <label for="pl-lat">Latitude</label>
              <input type="number" id="pl-lat" step="any" min="-90" max="90" required placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label for="pl-lng">Longitude</label>
              <input type="number" id="pl-lng" step="any" min="-180" max="180" required placeholder="e.g. -74.0060" />
            </div>
          </div>
          <div class="pl-marker-drag-wrap">
            <button
              type="button"
              id="pl-marker-drag"
              class="pl-marker-drag"
              aria-label="Drag onto the map to set the location"
              title="Drag onto the map to set the location"
            >${x}</button>
            <span class="pl-marker-drag-hint">Drag this pin onto the map to set the location.</span>
          </div>
          <div class="pl-gps-status" id="pl-gps-status" hidden></div>
          <div class="pl-field">
            <label for="pl-name">Location Name</label>
            <input type="text" id="pl-name" required placeholder="e.g. Brooklyn Bridge" />
          </div>
          <div class="pl-field">
            <label for="pl-desc">Description</label>
            <textarea id="pl-desc" rows="3" placeholder="Describe this place..."></textarea>
          </div>
          <button type="submit" class="pl-submit">Add to Map</button>
        </form>
      </div>
      <div class="pl-map-wrap">
        <div id="pl-map"></div>
      </div>
    </div>
  `}function G(o,e,t){o.addEventListener("pointerdown",n=>{if(n.button!==void 0&&n.button!==0)return;n.preventDefault(),o.setPointerCapture?.(n.pointerId);const a=document.createElement("div");a.className="pl-marker-drag-ghost",a.innerHTML=x,document.body.appendChild(a);const r=(i,u)=>{a.style.left=`${i}px`,a.style.top=`${u}px`};r(n.clientX,n.clientY);const s=(i,u)=>{const m=e.getBoundingClientRect();return i>=m.left&&i<=m.right&&u>=m.top&&u<=m.bottom},d=i=>{r(i.clientX,i.clientY),e.classList.toggle("pl-map-drop-target",s(i.clientX,i.clientY))},p=i=>{if(document.removeEventListener("pointermove",d),document.removeEventListener("pointerup",p),document.removeEventListener("pointercancel",p),a.remove(),e.classList.remove("pl-map-drop-target"),i.type==="pointerup"&&s(i.clientX,i.clientY)){const u=e.getBoundingClientRect();t(i.clientX-u.left,i.clientY-u.top)}};document.addEventListener("pointermove",d),document.addEventListener("pointerup",p),document.addEventListener("pointercancel",p)})}async function $(o="photo-location"){const e=document.getElementById(o);if(!e)return;C(e);const t=R("pl-map"),n=document.getElementById("pl-form"),a=document.getElementById("pl-photo"),r=document.getElementById("pl-preview"),s=document.getElementById("pl-preview-img"),d=document.getElementById("pl-lat"),p=document.getElementById("pl-lng"),i=document.getElementById("pl-gps-status"),u=document.getElementById("pl-map"),m=document.getElementById("pl-marker-drag");let v=null,h=!1;const b=(c,l)=>{i.hidden=!1,i.textContent=c,i.className=`pl-gps-status pl-gps-${l}`},y=j(t,(c,l)=>{d.value=l.toFixed(6),p.value=c.toFixed(6)}),w=()=>{const c=parseFloat(d.value),l=parseFloat(p.value);Number.isFinite(c)&&Number.isFinite(l)&&c>=-90&&c<=90&&l>=-180&&l<=180?y.set(l,c):y.clear()};d.addEventListener("input",w),p.addEventListener("input",w),a.addEventListener("change",async()=>{const c=a.files[0];if(!c)return;v=await U(c),s.src=v,r.hidden=!1,b("Reading EXIF data...","missing");const l=await P(c);l?(d.value=l.lat.toFixed(6),p.value=l.lng.toFixed(6),h=!0,b("GPS coordinates extracted from photo. Drop the pin on the map to override.","found"),w(),t.flyTo({center:[l.lng,l.lat],zoom:14})):(h=!1,b("No GPS data found. Drag the pin onto the map or enter coordinates manually.","missing"))}),G(m,u,(c,l)=>{const{lng:L,lat:E}=t.unproject([c,l]),B=h;d.value=E.toFixed(6),p.value=L.toFixed(6),y.set(L,E),h=!1,b(B?"Photo GPS overwritten with marker location.":"Location set from map. Drag the marker to fine-tune.","found")}),n.addEventListener("submit",async c=>{if(c.preventDefault(),!v)return;const l={name:document.getElementById("pl-name").value.trim(),description:document.getElementById("pl-desc").value.trim(),lat:parseFloat(d.value),lng:parseFloat(p.value),photoDataUrl:v};await F(l),I(t,l),t.flyTo({center:[l.lng,l.lat],zoom:14}),n.reset(),r.hidden=!0,i.hidden=!0,y.clear(),v=null,h=!1});try{const c=await N();t.on("load",()=>T(t,c))}catch{}"serviceWorker"in navigator&&navigator.serviceWorker.register("/photo-location-sw.js").catch(()=>{})}$("photo-location");
